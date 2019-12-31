import {DeclarationTransformer} from "../declaration-bundler-options";
import {TS} from "../../../../type/ts";
import {SourceFileBundlerVisitorOptions} from "../transformers/source-file-bundler/source-file-bundler-visitor-options";

export interface ApplyTransformersOptions {
	transformers: DeclarationTransformer[];
	visitorOptions: SourceFileBundlerVisitorOptions;
}

export function applyTransformers({transformers, visitorOptions}: ApplyTransformersOptions): TS.SourceFile {
	for (const transformer of transformers) {
		visitorOptions.sourceFile = transformer(visitorOptions);
	}
	return visitorOptions.sourceFile;
}
