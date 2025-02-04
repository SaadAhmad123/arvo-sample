const BREAKPOINTS = {
  320: 'xs',
  640: 'sm',
  768: 'md',
  1024: 'lg',
  1280: 'xl',
  1536: '2xl',
};

export default function imageLoader({ src, width }) {
  // Find the closest breakpoint for the requested width
  const breakpoint = Object.keys(BREAKPOINTS)
    .map(Number)
    .reduce((prev, curr) => (Math.abs(curr - width) < Math.abs(prev - width) ? curr : prev));

  // Check if browser supports AVIF
  const supportsAVIF = () => {
    try {
      return document.createElement('canvas').toDataURL('image/avif').indexOf('data:image/avif') === 0;
    } catch (e) {
      return false;
    }
  };

  // Use AVIF if supported, fallback to WebP
  const format = supportsAVIF() ? 'avif' : 'webp';

  // Maintain the original path structure
  const imagePath = src.startsWith('/') ? src : `/${src}`;
  const dirPath = imagePath.substring(0, imagePath.lastIndexOf('/'));
  const fileName = imagePath.substring(imagePath.lastIndexOf('/') + 1);

  return `/images/optimized${dirPath}/${fileName}-${breakpoint}.${format}`;
}
