import {TS} from "../../../../../../type/ts";
import {EnsureNoExportModifierTransformerVisitorOptions} from "../ensure-no-export-modifier-transformer-visitor-options";
import {preserveSymbols} from "../../../util/clone-node-with-symbols";
import {hasExportModifier, removeExportModifier} from "../../../util/modifier-util";

export function visitEnumDeclaration(options: EnsureNoExportModifierTransformerVisitorOptions<TS.EnumDeclaration>): TS.EnumDeclaration {
	const {node, typescript} = options;
	if (!hasExportModifier(node, typescript)) return node;
	return preserveSymbols(
		typescript.updateEnumDeclaration(node, node.decorators, removeExportModifier(node.modifiers, typescript), node.name, node.members),
		options
	);
}
