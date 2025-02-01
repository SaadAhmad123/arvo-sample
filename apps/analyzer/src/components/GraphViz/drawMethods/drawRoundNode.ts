import { RoundNodeParams, RoundNodeStyle } from './types';
import { wrapText } from './wrapText';

const DEFAULT_ROUND_STYLE: Required<RoundNodeStyle> = {
  fontSize: 10,
  textColor: 'black',
  backgroundColor: '#67e8f9',
  padding: 4,
  highlightColor: 'yellow',
  textBoxWidth: 20,
};

export const drawRoundNode = ({ node, ctx, style = {}, isHighlighted = false }: RoundNodeParams) => {
  // Merge default style with custom style
  const { fontSize, textColor, backgroundColor, padding, highlightColor, textBoxWidth } = {
    ...DEFAULT_ROUND_STYLE,
    ...Object.fromEntries(Object.entries(style).filter(([key, value]) => Boolean(value))),
  };

  const label = node.title;

  // Set up text properties
  ctx.font = `${fontSize}px sans-serif`;

  // Calculate text dimensions
  const maxWidth = textBoxWidth || ctx.measureText(label).width;
  const textData = wrapText(ctx, label, maxWidth);

  // Calculate node radius based on text box dimensions
  const radius = Math.max(textData.width, textData.height) / 2 + padding;

  // Draw circle background
  const centerX = node.x ?? 0;
  const centerY = node.y ?? 0;

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fillStyle = isHighlighted ? highlightColor : backgroundColor;
  ctx.fill();

  // Draw text
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = textColor;

  const lineHeight = textData.height / textData.lines.length;
  const startY = centerY - ((textData.lines.length - 1) * lineHeight) / 2;

  textData.lines.forEach((line, index) => {
    ctx.fillText(line, centerX, startY + index * lineHeight);
  });
};
