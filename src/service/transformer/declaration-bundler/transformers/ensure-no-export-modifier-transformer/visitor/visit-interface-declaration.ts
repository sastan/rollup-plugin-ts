import {TS} from "../../../../../../type/ts";
import {EnsureNoExportModifierTransformerVisitorOptions} from "../ensure-no-export-modifier-transformer-visitor-options";
import {preserveSymbols} from "../../../util/clone-node-with-symbols";
import {hasExportModifier, removeExportModifier} from "../../../util/modifier-util";

export function visitInterfaceDeclaration(
	options: EnsureNoExportModifierTransformerVisitorOptions<TS.InterfaceDeclaration>
): TS.InterfaceDeclaration {
	const {node, typescript} = options;
	if (!hasExportModifier(node, typescript)) return node;

	return preserveSymbols(
		typescript.updateInterfaceDeclaration(
			node,
			node.decorators,
			removeExportModifier(node.modifiers, typescript),
			node.name,
			node.typeParameters,
			node.heritageClauses,
			node.members
		),
		options
	);
}
