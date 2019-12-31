import {TS} from "../../../../../../type/ts";

export type ReferenceCache = WeakMap<TS.Node, boolean>;
export type NodeToReferencedIdentifiersCache = Map<string, Set<TS.Node>>;
export type SourceFileToNodeToReferencedIdentifiersCache = Map<string, NodeToReferencedIdentifiersCache>;
