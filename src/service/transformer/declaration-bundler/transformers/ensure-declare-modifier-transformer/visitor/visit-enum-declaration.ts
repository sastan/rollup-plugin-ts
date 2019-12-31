import {TS} from "../../../../../../type/ts";
import {EnsureDeclareModifierTransformerVisitorOptions} from "../ensure-declare-modifier-transformer-visitor-options";
import {ensureHasDeclareModifier, hasDeclareModifier} from "../../../util/modifier-util";
import {preserveSymbols} from "../../../util/clone-node-with-symbols";

export function visitEnumDeclaration(options: EnsureDeclareModifierTransformerVisitorOptions<TS.EnumDeclaration>): TS.EnumDeclaration {
	const {node, typescript} = options;
	if (hasDeclareModifier(node, typescript)) return node;

	return preserveSymbols(
		typescript.updateEnumDeclaration(node, node.decorators, ensureHasDeclareModifier(node.modifiers, typescript), node.name, node.members),
		options
	);
}
