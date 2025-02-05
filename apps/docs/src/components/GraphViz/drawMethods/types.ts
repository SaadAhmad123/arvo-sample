import type { NodeObject } from 'force-graph';
import type { GraphNode } from '../types';

export type BoxNodeStyle = {
  fontSize?: number;
  textColor?: string;
  backgroundColor?: string;
  cornerRadius?: number;
  padding?: number;
  highlightColor?: string;
  textBoxWidth?: number; // Added for text wrapping
};

export type RoundNodeStyle = {
  fontSize?: number;
  textColor?: string;
  backgroundColor?: string;
  padding?: number;
  highlightColor?: string;
  textBoxWidth?: number; // Optional fixed width for text box
};

export type DrawNodeParams<TStyle> = {
  node: NodeObject & GraphNode;
  ctx: CanvasRenderingContext2D;
  style?: TStyle;
  isHighlighted?: boolean;
};

export type RoundNodeParams = DrawNodeParams<RoundNodeStyle>;
export type BoxNodeParams = DrawNodeParams<BoxNodeStyle>;
