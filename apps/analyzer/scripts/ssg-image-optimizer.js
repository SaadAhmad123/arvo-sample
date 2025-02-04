const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');

const SIZES = {
  xs: { width: 320, quality: 80 },
  sm: { width: 640, quality: 80 },
  md: { width: 768, quality: 85 },
  lg: { width: 1024, quality: 85 },
  xl: { width: 1280, quality: 90 },
  '2xl': { width: 1536, quality: 90 },
};

const FORMAT_OPTIONS = {
  webp: {
    effort: 6,
    nearLossless: true,
    smartSubsample: true,
  },
  avif: {
    effort: 5,
    chromaSubsampling: '4:4:4',
  },
};

async function findImages(dir) {
  const images = [];
  const files = await fs.readdir(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = await fs.stat(fullPath);

    if (stat.isDirectory()) {
      images.push(...(await findImages(fullPath)));
    } else if (file.match(/\.(jpg|jpeg|png|webp|avif)$/i)) {
      images.push(fullPath);
    }
  }

  return images;
}

async function optimizeImage(inputPath, outputPath, width, quality, format) {
  const pipeline = sharp(inputPath).resize(width, null, {
    withoutEnlargement: true,
    fit: 'inside',
    fastShrinkOnLoad: true,
  });

  if (format === 'webp') {
    return pipeline.webp({ ...FORMAT_OPTIONS.webp, quality }).toFile(outputPath);
  }
  if (format === 'avif') {
    return pipeline.avif({ ...FORMAT_OPTIONS.avif, quality }).toFile(outputPath);
  }
}

async function copyFile(src, dest) {
  await fs.copyFile(src, dest);
}

async function optimizeImages() {
  const imageDir = path.join(process.cwd(), 'public');
  const outputDir = path.join(process.cwd(), 'out/images/optimized');

  console.log(`📁 Scanning for images in: ${imageDir}`);

  try {
    const images = await findImages(imageDir);
    console.log(`📸 Found ${images.length} images`);

    for (const imagePath of images) {
      const relativePath = path.relative(imageDir, imagePath);
      const dirName = path.dirname(relativePath);
      const name = path.basename(relativePath, path.extname(relativePath));
      const metadata = await sharp(imagePath).metadata();
      const extension = path.extname(relativePath);

      console.log(`\n⚡ Processing: ${relativePath} (${metadata.width}x${metadata.height})`);

      const targetDir = path.join(outputDir, dirName);
      await fs.mkdir(targetDir, { recursive: true });

      const lastGeneratedFiles = {};

      for (const [size, settings] of Object.entries(SIZES)) {
        for (const format of ['webp', 'avif']) {
          const outputPath = path.join(targetDir, `${name}${extension}-${settings.width}.${format}`);

          try {
            if (settings.width > metadata.width) {
              if (lastGeneratedFiles[format]) {
                await copyFile(lastGeneratedFiles[format], outputPath);
                console.log(`📑 Copied ${size}/${format}: Using last generated size`);
              } else {
                console.log(`⏩ Skipping ${size}/${format}: No smaller size available`);
              }
            } else {
              await optimizeImage(imagePath, outputPath, settings.width, settings.quality, format);
              lastGeneratedFiles[format] = outputPath;
              console.log(`✅ ${size}/${format}: ${path.relative(outputDir, outputPath)}`);
            }
          } catch (error) {
            // If optimization fails, copy original file
            const originalOutputPath = path.join(targetDir, `${name}${extension}-${settings.width}.${format}`);
            await copyFile(imagePath, originalOutputPath);
            console.log(
              `⚠️ Optimization failed for ${size}/${format}, copied original: ${path.relative(outputDir, originalOutputPath)}`,
            );
          }
        }
      }
    }

    console.log('\n🎉 Optimization complete!');
  } catch (error) {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  }
}

optimizeImages().catch((error) => {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
});
