import {DeconflicterVisitorOptions} from "../deconflicter-visitor-options";
import {TS} from "../../../../../../type/ts";
import {nodeArraysAreEqual} from "../../../util/node-arrays-are-equal";
import {addBindingToLexicalEnvironment} from "../../../util/add-binding-to-lexical-environment";
import {cloneLexicalEnvironment} from "../../../util/clone-lexical-environment";
import {isIdentifierFree} from "../../../util/is-identifier-free";
import {generateUniqueBinding} from "../../../util/generate-unique-binding";
import {ContinuationOptions} from "../deconflicter-options";
import {getIdForNode} from "../../../util/get-id-for-node";
import {preserveSymbols} from "../../../util/clone-node-with-symbols";

/**
 * Deconflicts the given InterfaceDeclaration.
 */
export function deconflictInterfaceDeclaration(options: DeconflicterVisitorOptions<TS.InterfaceDeclaration>): TS.InterfaceDeclaration | undefined {
	const {node, continuation, lexicalEnvironment, typescript, declarationToDeconflictedBindingMap} = options;
	let nameContResult: TS.InterfaceDeclaration["name"];
	const id = getIdForNode(options);

	if (isIdentifierFree(lexicalEnvironment, node.name.text)) {
		nameContResult = node.name;
		if (id != null) declarationToDeconflictedBindingMap.set(id, node.name.text);

		// The name creates a new local binding within the current LexicalEnvironment
		addBindingToLexicalEnvironment(lexicalEnvironment, node.name.text);
	} else {
		// Otherwise, deconflict it
		const uniqueBinding = generateUniqueBinding(lexicalEnvironment, node.name.text);
		nameContResult = typescript.createIdentifier(uniqueBinding);
		if (id != null) declarationToDeconflictedBindingMap.set(id, uniqueBinding);

		// The name creates a new local binding within the current LexicalEnvironment
		addBindingToLexicalEnvironment(lexicalEnvironment, uniqueBinding, node.name.text);
	}

	// The Type parameters, as well as the heritage clauses share the same lexical environment
	const nextContinuationOptions: ContinuationOptions = {lexicalEnvironment: cloneLexicalEnvironment(lexicalEnvironment)};

	const typeParametersContResult =
		node.typeParameters == null ? undefined : node.typeParameters.map(typeParameter => continuation(typeParameter, nextContinuationOptions));
	const heritageClausesContResult =
		node.heritageClauses == null ? undefined : node.heritageClauses.map(heritageClause => continuation(heritageClause, nextContinuationOptions));
	const membersContResult = node.members.map(member => continuation(member, {lexicalEnvironment}));

	const isIdentical =
		nameContResult === node.name &&
		nodeArraysAreEqual(typeParametersContResult, node.typeParameters) &&
		nodeArraysAreEqual(heritageClausesContResult, node.heritageClauses) &&
		nodeArraysAreEqual(membersContResult, node.members);

	if (isIdentical) {
		return node;
	}

	return preserveSymbols(
		typescript.updateInterfaceDeclaration(
			node,
			node.decorators,
			node.modifiers,
			nameContResult,
			typeParametersContResult,
			heritageClausesContResult,
			membersContResult
		),
		options
	);
}
