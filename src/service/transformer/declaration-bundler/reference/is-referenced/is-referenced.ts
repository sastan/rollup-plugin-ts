import {forEachChild, isClassDeclaration, isClassExpression, isEnumDeclaration, isExportAssignment, isExportDeclaration, isExportSpecifier, isFunctionDeclaration, isFunctionExpression, isIdentifier, isImportSpecifier, isInterfaceDeclaration, isModuleDeclaration, isTypeAliasDeclaration, isVariableDeclaration, Node} from "typescript";
import {IsReferencedOptions} from "./is-referenced-options";
import {nodeContainsChild} from "../../util/node-contains-child";
import {getIdentifiersForNode} from "../../util/get-identifiers-for-node";
import {ReferenceVisitorOptions} from "./reference-visitor-options";
import {isAmbientModuleRootLevelNode} from "../../util/is-ambient-module-root-level-node";
import {checkClassDeclaration} from "./visitor/check-class-declaration";
import {checkIdentifier} from "./visitor/check-identifier";
import {checkClassExpression} from "./visitor/check-class-expression";
import {checkInterfaceDeclaration} from "./visitor/check-interface-declaration";
import {checkEnumDeclaration} from "./visitor/check-enum-declaration";
import {checkTypeAliasDeclaration} from "./visitor/check-type-alias-declaration";
import {checkFunctionDeclaration} from "./visitor/check-function-declaration";
import {checkFunctionExpression} from "./visitor/check-function-expression";
import {checkVariableDeclaration} from "./visitor/check-variable-declaration";
import {checkImportSpecifier} from "./visitor/check-import-specifier";
import {checkExportSpecifier} from "./visitor/check-export-specifier";
import {LocalSymbolMap} from "../../../declaration-pre-bundler/declaration-pre-bundler-options";
import {hasExportModifier} from "../../../declaration-pre-bundler/util/modifier/modifier-util";

/**
 * Visits the given node. Returns true if it references the node to check for references, and false otherwise
 * @param {Node} currentNode
 * @return {boolean}
 */
function checkNode ({node, originalNode, ...rest}: ReferenceVisitorOptions): boolean {
	if (node === originalNode || nodeContainsChild(originalNode, node)) return false;

	if (isClassDeclaration(node)) {
		return checkClassDeclaration({node, originalNode, ...rest});
	} else if (isClassExpression(node)) {
		return checkClassExpression({node, originalNode, ...rest});
	} else if (isFunctionDeclaration(node)) {
		return checkFunctionDeclaration({node, originalNode, ...rest});
	} else if (isFunctionExpression(node)) {
		return checkFunctionExpression({node, originalNode, ...rest});
	} else if (isInterfaceDeclaration(node)) {
		return checkInterfaceDeclaration({node, originalNode, ...rest});
	} else if (isEnumDeclaration(node)) {
		return checkEnumDeclaration({node, originalNode, ...rest});
	} else if (isTypeAliasDeclaration(node)) {
		return checkTypeAliasDeclaration({node, originalNode, ...rest});
	} else if (isVariableDeclaration(node)) {
		return checkVariableDeclaration({node, originalNode, ...rest});
	} else if (isImportSpecifier(node)) {
		return checkImportSpecifier({node, originalNode, ...rest});
	} else if (isExportSpecifier(node)) {
		return checkExportSpecifier({node, originalNode, ...rest});
	} else if (isIdentifier(node)) {
		return checkIdentifier({node, originalNode, ...rest});
	} else {
		return rest.childContinuation(node);
	}
}

/**
 * Visits the given node. Returns true if it references the node to check for references, and false otherwise
 * @param {ReferenceVisitorOptions} options
 * @return {Node?}
 */
function visitNode ({node, originalNode, ...rest}: ReferenceVisitorOptions): void {
	if (node === originalNode || nodeContainsChild(originalNode, node)) return;

	if (isAmbientModuleRootLevelNode(node) && rest.continuation(node)) {
		rest.referencingNodes.add(node);
	}
}

/**
 * Returns true if the given Node is referenced within the given options
 * @param {IsReferencedOptions} opts
 * @return {Node[]}
 */
export function isReferenced<T extends Node> ({seenNodes = new Set(), ...options}: IsReferencedOptions<T>): boolean {
	// Exports are always referenced and should never be removed
	if (
		isExportDeclaration(options.node) ||
		isExportSpecifier(options.node) ||
		isExportAssignment(options.node) ||
		hasExportModifier(options.node) ||
		isModuleDeclaration(options.node)
	) {
		return true;
	}

	// If it has been computed previously, use the cached result
	if (options.referenceCache.has(options.node)) {
		return options.referenceCache.get(options.node)!;
	}

	// Assume that the node is referenced if the received node has been visited before in the recursive stack
	if (seenNodes.has(options.node)) {
		return true;
	} else {
		// Otherwise, add the node to the Set of seen nodes
		seenNodes.add(options.node);
	}

	// Collect the identifier for the node
	const identifiers = getIdentifiersForNode(options);

	// If there are no identifiers for the node, include it since it cannot be referenced.
	if (identifiers.size === 0) {
		return true;
	}

	// Collect all nodes that references the given node
	const referencingNodes = collectReferences(options, identifiers);

	// Compute the result
	const result =
		referencingNodes.length > 0 && referencingNodes.some(referencingNode => isReferenced({...options, seenNodes, node: referencingNode}));

	// Cache the result
	options.referenceCache.set(options.node, result);
	return result;
}

function collectReferences<T extends Node> (options: IsReferencedOptions<T>, identifiers: LocalSymbolMap): Node[] {
	const visitorOptions = {
		...options,
		referencingNodes: new Set<Node>(),
		identifiers,
		originalNode: options.node,
		childContinuation: (node: Node): boolean => {
			const result = forEachChild<boolean>(node, nextNode => checkNode({...visitorOptions, node: nextNode}));
			return result === true;
		},
		continuation: (node: Node): boolean => checkNode({...visitorOptions, node})
	};

	forEachChild<void>(options.sourceFile, node => visitNode({...visitorOptions, node}));
	return [...visitorOptions.referencingNodes];
}