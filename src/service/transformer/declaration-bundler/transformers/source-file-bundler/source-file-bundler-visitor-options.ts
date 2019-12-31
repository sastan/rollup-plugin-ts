import {TS} from "../../../../../type/ts";
import {DeclarationBundlerOptions} from "../../declaration-bundler-options";
import {LexicalEnvironment} from "../deconflicter/deconflicter-options";
import {SourceFileToExportedSymbolSet} from "../track-exports-transformer/track-exports-transformer-visitor-options";
import {ImportedSymbol} from "../track-imports-transformer/track-imports-transformer-visitor-options";

export interface SourceFileBundlerVisitorOptions extends DeclarationBundlerOptions {
	context: TS.TransformationContext;
	sourceFiles: TS.SourceFile[];
	sourceFile: TS.SourceFile;
	otherEntrySourceFilesForChunk: TS.SourceFile[];
	lexicalEnvironment: LexicalEnvironment;
	includedSourceFiles: Set<string>;

	// Declarations are represented by IDs which are mapped a string, indicating the deconflicted names for them
	declarationToDeconflictedBindingMap: Map<number, string>;

	// Some nodes are completely rewritten, under which circumstances the original symbol will be lost. However, it might be relevant to refer to the original symbol.
	// For example, for ImportTypeNodes that are replaced with an identifier, we want the Identifier to refer to the symbol of original quantifier
	nodeToOriginalSymbolMap: Map<TS.Node, TS.Symbol>;
	nodeToOriginalNodeMap: Map<TS.Node, TS.Node>;
	sourceFileToExportedSymbolSet: SourceFileToExportedSymbolSet;
	preservedImports: Map<string, Set<ImportedSymbol>>;
}
