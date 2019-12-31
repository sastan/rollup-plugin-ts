import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";
import {TS} from "../../../../../../type/ts";

export function visitFunctionExpression({
	node,
	continuation,
	typescript
}: TreeShakerVisitorOptions<TS.FunctionExpression>): TS.FunctionExpression | undefined {
	const nameContinuationResult = node.name == null ? undefined : continuation(node.name);
	if (nameContinuationResult == null) {
		return undefined;
	}
	return node.name === nameContinuationResult
		? node
		: typescript.updateFunctionExpression(
				node,
				node.modifiers,
				node.asteriskToken,
				nameContinuationResult,
				node.typeParameters,
				node.parameters,
				node.type,
				node.body
		  );
}
