import {DeconflicterVisitorOptions} from "./deconflicter-visitor-options";
import {TS} from "../../../../../type/ts";
import {deconflictBindingElement} from "./visitor/deconflict-binding-element";
import {deconflictClassDeclaration} from "./visitor/deconflict-class-declaration";
import {deconflictClassExpression} from "./visitor/deconflict-class-expression";
import {deconflictEnumDeclaration} from "./visitor/deconflict-enum-declaration";
import {deconflictEnumMember} from "./visitor/deconflict-enum-member";
import {deconflictExportSpecifier} from "./visitor/deconflict-export-specifier";
import {deconflictFunctionDeclaration} from "./visitor/deconflict-function-declaration";
import {deconflictFunctionExpression} from "./visitor/deconflict-function-expression";
import {deconflictGetAccessorDeclaration} from "./visitor/deconflict-get-accessor-declaration";
import {deconflictIdentifier} from "./visitor/deconflict-identifier";
import {deconflictImportClause} from "./visitor/deconflict-import-clause";
import {deconflictImportSpecifier} from "./visitor/deconflict-import-specifier";
import {deconflictInterfaceDeclaration} from "./visitor/deconflict-interface-declaration";
import {deconflictMappedTypeNode} from "./visitor/deconflict-mapped-type-node";
import {deconflictMethodDeclaration} from "./visitor/deconflict-method-declaration";
import {deconflictIndexSignatureDeclaration} from "./visitor/deconflict-index-signature-declaration";
import {deconflictMethodSignature} from "./visitor/deconflict-method-signature";
import {deconflictModuleDeclaration} from "./visitor/deconflict-module-declaration";
import {deconflictNamespaceImport} from "./visitor/deconflict-namespace-import";
import {deconflictParameterDeclaration} from "./visitor/deconflict-parameter-declaration";
import {deconflictPropertyAssignment} from "./visitor/deconflict-property-assignment";
import {deconflictPropertyDeclaration} from "./visitor/deconflict-property-declaration";
import {deconflictPropertySignature} from "./visitor/deconflict-property-signature";
import {deconflictSetAccessorDeclaration} from "./visitor/deconflict-set-accessor-declaration";
import {deconflictTypeAliasDeclaration} from "./visitor/deconflict-type-alias-declaration";
import {deconflictTypeParameterDeclaration} from "./visitor/deconflict-type-parameter-declaration";
import {deconflictVariableDeclaration} from "./visitor/deconflict-variable-declaration";
import {ContinuationOptions} from "./deconflicter-options";
import {SourceFileBundlerVisitorOptions} from "../source-file-bundler/source-file-bundler-visitor-options";
import {shouldDebugMetrics, shouldDebugSourceFile} from "../../../../../util/is-debug/should-debug";
import {benchmark} from "../../../../../util/benchmark/benchmark-util";

/**
 * Deconflicts the given Node. Everything but LValues will be updated here
 */
function deconflictNode({node, ...options}: DeconflicterVisitorOptions<TS.Node>): TS.Node | undefined {
	if (options.typescript.isBindingElement(node)) {
		return deconflictBindingElement({node, ...options});
	} else if (options.typescript.isClassDeclaration(node)) {
		return deconflictClassDeclaration({node, ...options});
	} else if (options.typescript.isClassExpression(node)) {
		return deconflictClassExpression({node, ...options});
	} else if (options.typescript.isEnumDeclaration(node)) {
		return deconflictEnumDeclaration({node, ...options});
	} else if (options.typescript.isEnumMember(node)) {
		return deconflictEnumMember({node, ...options});
	} else if (options.typescript.isExportSpecifier(node)) {
		return deconflictExportSpecifier({node, ...options});
	} else if (options.typescript.isFunctionDeclaration(node)) {
		return deconflictFunctionDeclaration({node, ...options});
	} else if (options.typescript.isFunctionExpression(node)) {
		return deconflictFunctionExpression({node, ...options});
	} else if (options.typescript.isGetAccessorDeclaration(node)) {
		return deconflictGetAccessorDeclaration({node, ...options});
	} else if (options.typescript.isIdentifier(node)) {
		return deconflictIdentifier({node, ...options});
	} else if (options.typescript.isImportClause(node)) {
		return deconflictImportClause({node, ...options});
	} else if (options.typescript.isImportSpecifier(node)) {
		return deconflictImportSpecifier({node, ...options});
	} else if (options.typescript.isInterfaceDeclaration(node)) {
		return deconflictInterfaceDeclaration({node, ...options});
	}

	// MappedTypeNodes may not be part of the current Typescript version, hence the optional call
	else if (options.typescript.isMappedTypeNode?.(node)) {
		return deconflictMappedTypeNode({node, ...options});
	} else if (options.typescript.isMethodDeclaration(node)) {
		return deconflictMethodDeclaration({node, ...options});
	} else if (options.typescript.isIndexSignatureDeclaration(node)) {
		return deconflictIndexSignatureDeclaration({node, ...options});
	} else if (options.typescript.isMethodSignature(node)) {
		return deconflictMethodSignature({node, ...options});
	} else if (options.typescript.isModuleDeclaration(node)) {
		return deconflictModuleDeclaration({node, ...options});
	} else if (options.typescript.isNamespaceImport(node)) {
		return deconflictNamespaceImport({node, ...options});
	} else if (options.typescript.isParameter(node)) {
		return deconflictParameterDeclaration({node, ...options});
	} else if (options.typescript.isPropertyAssignment(node)) {
		return deconflictPropertyAssignment({node, ...options});
	} else if (options.typescript.isPropertyDeclaration(node)) {
		return deconflictPropertyDeclaration({node, ...options});
	} else if (options.typescript.isPropertySignature(node)) {
		return deconflictPropertySignature({node, ...options});
	} else if (options.typescript.isSetAccessorDeclaration(node)) {
		return deconflictSetAccessorDeclaration({node, ...options});
	} else if (options.typescript.isTypeAliasDeclaration(node)) {
		return deconflictTypeAliasDeclaration({node, ...options});
	} else if (options.typescript.isTypeParameterDeclaration(node)) {
		return deconflictTypeParameterDeclaration({node, ...options});
	} else if (options.typescript.isVariableDeclaration(node)) {
		return deconflictVariableDeclaration({node, ...options});
	} else return options.childContinuation(node, {lexicalEnvironment: options.lexicalEnvironment});
}

/**
 * Deconflicts local bindings
 */
export function deconflicter({typescript, context, lexicalEnvironment, ...options}: SourceFileBundlerVisitorOptions): TS.SourceFile {
	const fullBenchmark = shouldDebugMetrics(options.pluginOptions.debug, options.sourceFile)
		? benchmark(`Deconflicting ${options.sourceFile.fileName}`)
		: undefined;

	if (shouldDebugSourceFile(options.pluginOptions.debug, options.sourceFile)) {
		console.log(`=== BEFORE DECONFLICTING === (${options.sourceFile.fileName})`);
		console.log(options.printer.printFile(options.sourceFile));
		console.time(`Deconflicting ${options.sourceFile.fileName}`);
	}

	// Prepare some VisitorOptions
	const visitorOptions = {
		...options,
		context,
		typescript,

		childContinuation: <U extends TS.Node>(node: U, continuationOptions: ContinuationOptions): U =>
			typescript.visitEachChild(
				node,
				nextNode =>
					deconflictNode({
						...visitorOptions,
						...continuationOptions,
						node: nextNode
					}),
				context
			),

		continuation: <U extends TS.Node>(node: U, continuationOptions: ContinuationOptions): U =>
			deconflictNode({
				...visitorOptions,
				...continuationOptions,
				node
			}) as U
	};

	const result = typescript.visitEachChild(options.sourceFile, nextNode => visitorOptions.continuation(nextNode, {lexicalEnvironment}), context);

	if (shouldDebugSourceFile(options.pluginOptions.debug, options.sourceFile)) {
		console.log(`=== AFTER DECONFLICTING === (${options.sourceFile.fileName})`);
		console.log(options.printer.printFile(result));
	}

	if (fullBenchmark != null) fullBenchmark.finish();

	return result;
}
