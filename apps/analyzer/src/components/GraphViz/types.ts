import { ProcessedGraphEdge } from '@/components/GraphViz/processEdgeCurvature/types';
import type { NodeObject } from 'force-graph';

export type EdgeDirection = 'unidirectional' | 'bidirectional';
export type EdgeLineType = 'dotted' | 'solid';
export type GraphNodeShape = 'rounded' | 'box';

export type GraphNode = {
  id: string;
  title: string;
  group: string;
  metadata?: Record<string, any>;
  style?: {
    shape: GraphNodeShape;
    color: {
      background: {
        default: string;
        hover?: string;
      };
      text: {
        default: string;
        hover?: string;
      };
    };
  };
};

export type GraphEdge = {
  id?: string;
  source: string;
  target: string;
  title: string;
  direction: EdgeDirection;
  lineType: EdgeLineType;
  metadata?: Record<string, any>;
  style?: {
    color?: {
      link?: string
      background?: string
      text?: string
    }
  }
};

export type GraphData = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};

export interface IGraphViz {
  data: GraphData;
  nodeSize?: number;
  onNodeClick?: (node: NodeObject & GraphEdge) => void;
  onLinkClick?: (link: ProcessedGraphEdge) => void;
  backgroundColor?: string;
  
}
