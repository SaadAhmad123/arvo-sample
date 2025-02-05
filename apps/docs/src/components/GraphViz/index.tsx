'use client';

import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import { Button, IconButton } from '@repo/material-ui';
import ForceGraph, { type NodeObject } from 'force-graph';
import React, { useEffect, useRef, useState } from 'react';
import { drawBoxNode, drawRoundNode } from './drawMethods';
import { calculateCurvedTextPosition, processEdgeCurvature } from './processEdgeCurvature';
import type { ProcessedGraphEdge, TextPosition } from './processEdgeCurvature/types';
import type { GraphNode, IGraphViz } from './types';
import { DottedBackground } from './DottedBackground';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';

export const GraphViz: React.FC<IGraphViz> = ({
  data,
  onNodeClick,
  onLinkClick,
  nodeSize = 24,
  backgroundColor = 'rgba(0,0,0,0)',
}) => {
  const [render, setRender] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<SVGSVGElement>(null);
  const graphRef = useRef(null);
  const hoveredComponentRef = useRef({
    nodes: new Set<string>(),
    links: new Set<string>(),
    linkConnectedNodes: new Set<string>(),
  });
  const globalfontSize: number = 16;
  const curvatureMinMax = 0.15;

  useEffect(() => {
    console.log({ render, message: 'Rendering the graph...' });
    if (!containerRef.current || !data?.nodes?.length || !data?.edges?.length) return;
    const processedEdges: ProcessedGraphEdge[] = processEdgeCurvature(data.edges, curvatureMinMax);
    // @ts-ignore
    const graph = ForceGraph()(containerRef.current)
      .graphData({
        nodes: data.nodes,
        links: processedEdges,
      })
      .nodeRelSize(nodeSize)
      .height(containerRef.current.offsetHeight)
      .width(containerRef.current.offsetWidth)
      .backgroundColor(backgroundColor)
      .linkCurvature((link: ProcessedGraphEdge) => link.curvature)
      .linkDirectionalArrowLength((link: ProcessedGraphEdge) =>
        link.direction === 'bidirectional' ? 0 : hoveredComponentRef.current.links.has(link?.id ?? '') ? 24 : 16,
      )
      .linkDirectionalArrowRelPos(0.8)
      .linkWidth((link: ProcessedGraphEdge) => (hoveredComponentRef.current.links.has(link?.id ?? '') ? 3 : 1.5))
      .linkLineDash((link: ProcessedGraphEdge) => (link.lineType === 'dotted' ? [10, 10] : null))
      .linkColor((link: ProcessedGraphEdge) => link?.style?.color?.link ?? 'grey')
      .linkDirectionalParticleColor((link: ProcessedGraphEdge) => link?.style?.color?.link ?? 'grey')
      .linkDirectionalParticleWidth((link: ProcessedGraphEdge) =>
        link.direction === 'bidirectional' ? 0 : hoveredComponentRef.current.links.has(link?.id ?? '') ? 8 : 4,
      )
      .linkDirectionalParticles((link: ProcessedGraphEdge) => (link.direction === 'bidirectional' ? 0 : 2))
      .linkDirectionalParticleSpeed(1e-3)
      .enableZoomInteraction(true)
      .onNodeHover((node: GraphNode) => {
        hoveredComponentRef.current.nodes.clear();
        if (node?.id) {
          hoveredComponentRef.current.nodes.add(node.id);
        }
      })
      .onLinkHover(
        (
          link: Omit<ProcessedGraphEdge, 'source' | 'target'> & {
            source: GraphNode & NodeObject;
            target: GraphNode & NodeObject;
          },
        ) => {
          hoveredComponentRef.current.links.clear();
          hoveredComponentRef.current.linkConnectedNodes.clear();
          if (link?.id && link?.lineType !== 'dotted') {
            hoveredComponentRef.current.links.add(link.id);
            hoveredComponentRef.current.linkConnectedNodes.add(
              typeof link.source === 'object' ? link.source.id : link.source,
            );
            hoveredComponentRef.current.linkConnectedNodes.add(
              typeof link.target === 'object' ? link.target.id : link.target,
            );
          }
        },
      )
      .nodeCanvasObject((node: NodeObject & GraphNode, ctx: CanvasRenderingContext2D) => {
        let backgroundColor = node.style?.color?.background?.default;
        let textColor = node.style?.color?.text?.default;
        if (
          hoveredComponentRef.current.nodes.has(node.id) ||
          hoveredComponentRef.current.linkConnectedNodes.has(node.id)
        ) {
          backgroundColor = node.style?.color?.background?.hover ?? backgroundColor;
          textColor = node.style?.color?.text?.hover ?? textColor;
        }
        if (node.style?.shape === 'rounded') {
          drawRoundNode({
            node,
            ctx,
            isHighlighted: false,
            style: {
              textColor: textColor,
              backgroundColor: backgroundColor,
            },
          });
          return;
        }
        drawBoxNode({
          node,
          ctx,
          isHighlighted: false,
          style: {
            textColor: textColor,
            backgroundColor: backgroundColor,
          },
        });
      })
      .onNodeClick(onNodeClick)
      .onLinkClick(onLinkClick)
      .linkCanvasObjectMode(() => 'after')
      .linkCanvasObject(
        (
          link: Omit<ProcessedGraphEdge, 'source' | 'target'> & {
            source: GraphNode & NodeObject;
            target: GraphNode & NodeObject;
          },
          ctx: CanvasRenderingContext2D,
        ) => {
          const start = link.source;
          const end = link.target;
          if (typeof start !== 'object' || typeof end !== 'object') return;
          const label = link.title;
          const fontSize = globalfontSize * 0.9;
          ctx.font = `${fontSize}px Sans-Serif`;
          const textWidth = ctx.measureText(label).width;
          const bckgDimensions = [textWidth, fontSize].map((n) => n + fontSize * 0.8);
          let textPosition: TextPosition = {
            position: { x: ((start.x ?? 0) + (end.x ?? 0)) / 2, y: ((start.y ?? 0) + (end.y ?? 0)) / 2 },
            angle: Math.atan2((end.y ?? 0) - (start.y ?? 0), (end.x ?? 0) - (start.x ?? 0)),
          };
          if (link.curvature) {
            textPosition = calculateCurvedTextPosition(
              {
                x: start.x ?? 0,
                y: start.y ?? 0,
              },
              {
                x: end.x ?? 0,
                y: end.y ?? 0,
              },
              link.curvature ?? 0,
            );
          }
          ctx.save();
          ctx.translate(textPosition.position.x, textPosition.position.y);
          ctx.rotate(textPosition.angle);
          // Adjust text angle for readability
          if (Math.abs(textPosition.angle) > Math.PI / 2) {
            ctx.rotate(Math.PI);
          }
          ctx.fillStyle = link?.style?.color?.background ?? 'rgba(255, 255, 255, 1)';
          ctx.fillRect(-bckgDimensions[0] / 2, -bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1]);
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = link?.style?.color?.text ?? 'black';
          ctx.fillText(label, 0, 0);
          ctx.restore();
        },
      );

    graph
      .d3Force('charge')
      .strength(-10000 * 8)
      .distanceMin(1000)
      .distanceMax(1500);
    graph.d3AlphaDecay(0.1);

    graph.onZoom((transform: { k: number; x: number; y: number }) => {
      if (backgroundRef.current) {
        const pattern = backgroundRef.current.querySelector('#dotPattern');
        if (pattern) {
          const scale = transform.k;
          const translateX = -1 * transform.x;
          const translateY = -1 * transform.y;

          pattern.setAttribute('patternTransform', `translate(${translateX} ${translateY}) scale(${scale})`);
        }
      }
    });

    graphRef.current = graph;
    return () => {
      graph._destructor();
    };
  }, [data, backgroundColor, nodeSize, onNodeClick, onLinkClick, render]);

  return (
    <div className='relative flex flex-1 overflow-hidden'>
      <div className='flex-1 overflow-hidden' ref={containerRef} />
      <DottedBackground ref={backgroundRef} />
      <div className='absolute left-4 bottom-4 flex items-center justify-start gap-2'>
        <IconButton
          icon={<RotateLeftIcon />}
          variant='tonal'
          tooltip='Refresh the graph'
          onClick={() => {
            setRender(!render);
          }}
        />
        <Button
          type='button'
          variant='elevated'
          title='Center'
          icon={<CenterFocusStrongIcon />}
          onClick={() => {
            // @ts-ignore
            graphRef.current?.zoomToFit(1000, 100);
          }}
        />
      </div>
    </div>
  );
};
