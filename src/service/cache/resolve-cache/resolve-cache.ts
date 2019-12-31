import {IGetResolvedIdWithCachingOptions} from "./i-get-resolved-id-with-caching-options";
import {ExtendedResolvedModule, IResolveCache} from "./i-resolve-cache";
import {ensureAbsolute, isTslib, nativeNormalize, normalize, setExtension} from "../../../util/path/path-util";

import {DECLARATION_EXTENSION, JS_EXTENSION} from "../../../constant/constant";
import {FileSystem} from "../../../util/file-system/file-system";
import {TS} from "../../../type/ts";

export interface ResolveCacheOptions {
	fileSystem: FileSystem;
}

/**
 * A Cache over resolved modules
 */
export class ResolveCache implements IResolveCache {
	/**
	 * A memory-persistent cache of resolved modules for files over time
	 */
	private readonly RESOLVE_CACHE: Map<string, Map<string, ExtendedResolvedModule | null>> = new Map();

	constructor(private readonly options: ResolveCacheOptions) {}

	/**
	 * Gets the resolved path for an id from a parent
	 */
	getFromCache(id: string, parent: string): ExtendedResolvedModule | null | undefined {
		const parentMap = this.RESOLVE_CACHE.get(parent);
		if (parentMap == null) return undefined;
		return parentMap.get(id);
	}

	/**
	 * Deletes the entry matching the given parent
	 */
	delete(parent: string): boolean {
		return this.RESOLVE_CACHE.delete(parent);
	}

	clear(): void {
		this.RESOLVE_CACHE.clear();
	}

	/**
	 * Sets the given resolved module in the resolve cache
	 */
	setInCache(result: ExtendedResolvedModule | null, id: string, parent: string): ExtendedResolvedModule | null {
		let parentMap = this.RESOLVE_CACHE.get(parent);
		if (parentMap == null) {
			parentMap = new Map();
			this.RESOLVE_CACHE.set(parent, parentMap);
		}
		parentMap.set(id, result);
		return result;
	}

	/**
	 * Resolves a module name, including internal helpers such as tslib, even if they aren't included in the language service
	 */
	resolveModuleName(
		typescript: typeof TS,
		moduleName: string,
		containingFile: string,
		compilerOptions: TS.CompilerOptions,
		host: TS.ModuleResolutionHost,
		cache?: TS.ModuleResolutionCache,
		redirectedReference?: TS.ResolvedProjectReference
	): TS.ResolvedModuleWithFailedLookupLocations {
		// Default to using Typescript's resolver directly
		return typescript.resolveModuleName(moduleName, containingFile, compilerOptions, host, cache, redirectedReference);
	}

	/**
	 * Gets a cached module result for the given file from the given parent and returns it if it exists already.
	 * If not, it will compute it, update the cache, and then return it
	 */
	get({
		id,
		parent,
		moduleResolutionHost,
		options,
		cwd,
		supportedExtensions,
		typescript
	}: IGetResolvedIdWithCachingOptions): ExtendedResolvedModule | null {
		let cacheResult = this.getFromCache(id, parent);

		if (cacheResult != null) {
			return cacheResult;
		}

		// Resolve the file via Typescript, either through classic or node module resolution
		const {resolvedModule} = this.resolveModuleName(typescript, id, parent, options, moduleResolutionHost) as {
			resolvedModule: ExtendedResolvedModule | undefined;
		};

		// If it could not be resolved, the cache result will be equal to null
		if (resolvedModule == null) {
			cacheResult = null;
		}

		// Otherwise, proceed
		else {
			// Make sure that the path is absolute from the cwd
			resolvedModule.resolvedFileName = normalize(ensureAbsolute(cwd, resolvedModule.resolvedFileName!));

			if (resolvedModule.resolvedFileName.endsWith(DECLARATION_EXTENSION)) {
				resolvedModule.resolvedAmbientFileName = resolvedModule.resolvedFileName;
				resolvedModule.resolvedFileName = undefined;
				resolvedModule.extension = DECLARATION_EXTENSION as TS.Extension;

				if (isTslib(id)) {
					const candidate = normalize(setExtension(resolvedModule.resolvedAmbientFileName, `.es6${JS_EXTENSION}`));

					if (this.options.fileSystem.fileExists(nativeNormalize(candidate))) {
						resolvedModule.resolvedFileName = candidate;
					}
				}

				// Don't go and attempt to resolve sources for external libraries
				else if (resolvedModule.isExternalLibraryImport == null || !resolvedModule.isExternalLibraryImport) {
					// Try to determine the resolved file name.
					for (const extension of supportedExtensions) {
						const candidate = normalize(setExtension(resolvedModule.resolvedAmbientFileName, extension));

						if (this.options.fileSystem.fileExists(nativeNormalize(candidate))) {
							resolvedModule.resolvedFileName = candidate;
							break;
						}
					}
				}
			} else {
				resolvedModule.resolvedAmbientFileName = undefined;
				const candidate = normalize(setExtension(resolvedModule.resolvedFileName, DECLARATION_EXTENSION));

				if (this.options.fileSystem.fileExists(nativeNormalize(candidate))) {
					resolvedModule.resolvedAmbientFileName = candidate;
				}
			}

			cacheResult = resolvedModule;
		}

		// Store the new result in the cache
		return this.setInCache(cacheResult, id, parent);
	}
}
