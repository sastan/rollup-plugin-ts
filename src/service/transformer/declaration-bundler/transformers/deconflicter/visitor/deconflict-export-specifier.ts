import {DeconflicterVisitorOptions} from "../deconflicter-visitor-options";
import {TS} from "../../../../../../type/ts";
import {preserveSymbols} from "../../../util/clone-node-with-symbols";

/**
 * Deconflicts the given ExportSpecifier.
 */
export function deconflictExportSpecifier(options: DeconflicterVisitorOptions<TS.ExportSpecifier>): TS.ExportSpecifier | undefined {
	const {node, continuation, lexicalEnvironment, typescript} = options;
	const propertyName = node.propertyName ?? node.name;
	const propertyNameContResult = continuation(propertyName, {lexicalEnvironment});

	// If the ExportSpecifier is something like '{Foo}' but 'Foo' has been deconflicted in this SourceFile to something else,
	// we should re-write it to something like '{Foo$0 as Foo}'
	if (propertyNameContResult !== propertyName) {
		return preserveSymbols(
			typescript.updateExportSpecifier(node, propertyNameContResult.text === node.name.text ? undefined : propertyNameContResult, node.name),
			options
		);
	}

	return node;
}
