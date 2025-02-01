import type { GraphEdge } from '../types';
import type { Point2D, ProcessedEdgeGroups, ProcessedGraphEdge, TextPosition } from './types';
import { v4 as uuid4 } from 'uuid'

export const processEdgeCurvature = (edges: GraphEdge[], curvatureMinMax: number): ProcessedGraphEdge[] => {
  const processedEdges = edges.map((item) => ({
    ...item,
    id: item.id ?? uuid4(),
    nodePairId: `${item.source}_${item.target}`,
    curvature: 0,
  })) as ProcessedGraphEdge[];
  const groups: ProcessedEdgeGroups = {
    selfLoopLinks: {},
    sameNodesLinks: {},
  };

  for (const link of processedEdges) {
    const { source, target, nodePairId } = link;
    const map = source === target ? groups.selfLoopLinks : groups.sameNodesLinks;
    map[nodePairId] = map[nodePairId] || [];
    map[nodePairId].push(link);
  }

  // Process self-loops
  for (const links of Object.values(groups.selfLoopLinks)) {
    const lastIndex = links.length - 1;
    if (lastIndex >= 0) {
      links[lastIndex].curvature = 1;
      const delta = (1 - curvatureMinMax) / Math.max(lastIndex, 1);
      for (let i = 0; i < lastIndex; i++) {
        links[i].curvature = curvatureMinMax + i * delta;
      }
    }
  }

  // Process parallel links
  for (const links of Object.values(groups.sameNodesLinks)) {
    if (links.length > 1) {
      const lastIndex = links.length - 1;
      const lastLink = links[lastIndex];
      lastLink.curvature = curvatureMinMax;
      const delta = (2 * curvatureMinMax) / Math.max(lastIndex, 1);

      for (let i = 0; i < lastIndex; i++) {
        links[i].curvature = -curvatureMinMax + i * delta;
        if (lastLink.source !== links[i].source) {
          links[i].curvature *= -1;
        }
      }
    }
  }

  return processedEdges;
};

export const calculateCurvedTextPosition = (start: Point2D, end: Point2D, curvature: number): TextPosition => {
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const norm = Math.sqrt(dx * dx + dy * dy);
  const nx = -dy / norm;
  const ny = dx / norm;

  const pathDistance = Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2);
  const controlX = midX + curvature * pathDistance * nx;
  const controlY = midY + curvature * pathDistance * ny;

  return {
    position: {
      x: midX + (curvature * pathDistance * nx) / 2,
      y: midY + (curvature * pathDistance * ny) / 2,
    },
    angle: Math.atan2(controlY - midY, controlX - midX) + Math.PI / 2,
  };
};
