export const wrapText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): { lines: string[]; width: number; height: number } => {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  let maxLineWidth = 0;

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
      maxLineWidth = Math.max(maxLineWidth, ctx.measureText(currentLine).width);
    } else {
      currentLine = testLine;
      maxLineWidth = Math.max(maxLineWidth, testWidth);
    }
  }
  lines.push(currentLine);

  const lineHeightMultiplier = 1.75;
  const singleLineHeight = ctx.measureText('M').actualBoundingBoxAscent + ctx.measureText('M').actualBoundingBoxDescent;

  return {
    lines,
    width: maxLineWidth,
    height: lines.length * singleLineHeight * lineHeightMultiplier,
  };
};
