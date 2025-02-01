import type { GraphEdge } from '../types';

export type Point2D = {
  x: number;
  y: number;
};

export type ProcessedGraphEdge = GraphEdge & {
  nodePairId: string;
  curvature: number;
  source: string;
  target: string;
};

export type NodePairMap = Record<string, ProcessedGraphEdge[]>;

export type ProcessedEdgeGroups = {
  selfLoopLinks: NodePairMap;
  sameNodesLinks: NodePairMap;
};

export type TextPosition = {
  position: Point2D;
  angle: number;
};
