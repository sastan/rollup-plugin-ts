import {TS} from "../../../../../../type/ts";
import {TrackImportsTransformerVisitorOptions} from "../track-imports-transformer-visitor-options";

export function visitImportTypeNode({node, typescript, markAsImported}: TrackImportsTransformerVisitorOptions<TS.ImportTypeNode>): void {
	if (!typescript.isLiteralTypeNode(node.argument) || !typescript.isStringLiteralLike(node.argument.literal) || node.qualifier == null) return;
	const moduleSpecifier = node.argument.literal.text;

	const name = typescript.isIdentifier(node.qualifier)
		? node.qualifier
		: typescript.isIdentifier(node.qualifier.left)
		? node.qualifier.left
		: undefined;
	if (name == null) return;
	markAsImported({
		name,
		moduleSpecifier,
		isDefaultImport: false,
		propertyName: name
	});
}
