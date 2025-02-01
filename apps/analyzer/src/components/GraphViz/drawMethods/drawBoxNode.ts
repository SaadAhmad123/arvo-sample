import { BoxNodeParams, BoxNodeStyle } from './types';
import { wrapText } from './wrapText';

const DEFAULT_STYLE: Required<BoxNodeStyle> = {
  fontSize: 16,
  textColor: 'black',
  backgroundColor: '#67e8f9',
  cornerRadius: 20,
  padding: 16,
  highlightColor: 'yellow',
  textBoxWidth: 200,
};

export const drawBoxNode = ({ node, ctx, style = {}, isHighlighted = false }: BoxNodeParams) => {
  // Merge default style with custom style
  const { fontSize, textColor, backgroundColor, cornerRadius, padding, highlightColor, textBoxWidth } = {
    ...DEFAULT_STYLE,
    ...Object.fromEntries(Object.entries(style).filter(([key, value]) => Boolean(value))),
  };

  const label = node.title;

  // Set up text properties
  ctx.font = `${fontSize}px sans-serif`;

  // Calculate text dimensions with wrapping
  const maxWidth = textBoxWidth || ctx.measureText(label).width;
  const textData = wrapText(ctx, label, maxWidth);

  // Calculate box dimensions
  const width = textData.width + padding * 2;
  const height = textData.height + padding * 2;
  const radius = cornerRadius;

  // Set up box properties
  ctx.fillStyle = isHighlighted ? highlightColor : backgroundColor;

  // Calculate box position
  const x = (node.x ?? 0) - width / 2;
  const y = (node.y ?? 0) - height / 2;

  // Draw rounded rectangle
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();

  // Draw wrapped text
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = textColor;

  const lineHeight = textData.height / textData.lines.length;
  const startY = (node.y ?? 0) - ((textData.lines.length - 1) * lineHeight) / 2;

  textData.lines.forEach((line, index) => {
    ctx.fillText(line, node.x ?? 0, startY + index * lineHeight);
  });
};
