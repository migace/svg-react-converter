import camelcase from 'camelcase';
import path from 'path';
import fs from 'fs';
import { IProcessedSvgFile } from './processSvgFile';

/*
 * This file is part of the SVG to React component conversion tool.
 * It provides functionality to generate index files for directories containing
 * converted SVG files.
 *
 * @license MIT
 * @see
 */
export async function generateIndexFiles(
  processedFiles: IProcessedSvgFile[],
  outputDir: string,
) {
  // Group processed files by directory
  const filesByDir = processedFiles.reduce((acc, file) => {
    if (!file) return acc;

    const dirPath = file.outputPath;
    if (!acc[dirPath]) {
      acc[dirPath] = [];
    }
    acc[dirPath].push(file);
    return acc;
  }, {} as Record<string, IProcessedSvgFile[]>);

  // Generate index.ts for each directory
  for (const [dirPath, files] of Object.entries(filesByDir)) {
    const indexPath = path.join(outputDir, dirPath, 'index.ts');
    const indexContent = files
      .map((file) => {
        const componentName = file.componentName;
        const fileName = path.basename(file.filePath, '.svg');
        return `export { default as ${camelcase(
          componentName,
        )} } from './${fileName}';`;
      })
      .join('\n');

    await fs.promises.writeFile(indexPath, indexContent + '\n');
  }
}
