import fs from 'fs';
import path from 'path';
import { getComponentName } from './getComponentName';
import { transform } from '@svgr/core';

export interface IProcessedSvgFile {
  filePath: string;
  componentName: string;
  outputPath: string;
}

/**
 * Processes an SVG file and converts it to a React component.
 *
 * @param {string} filePath - The path to the SVG file.
 * @param {string} inputDir - The input directory containing SVG files.
 * @param {string} outputDir - The output directory for React components.
 * @param {Record<string, unknown>} svgrConfig - Configuration options for SVGR.
 * @returns {Promise<IProcessedSvgFile | null>} - The processed SVG file information or null if an error occurs.
 */
export async function processSvgFile(
  filePath: string,
  inputDir: string,
  outputDir: string,
  svgrConfig: Record<string, unknown>,
): Promise<IProcessedSvgFile | null> {
  const svgContent = await fs.promises.readFile(filePath, 'utf8');
  const relativePath = path.relative(inputDir, filePath);
  const componentName = getComponentName(filePath);
  const outputFilePath = path.join(
    outputDir,
    path.dirname(relativePath),
    `${componentName}.tsx`,
  );

  try {
    const componentCode = await transform(svgContent, svgrConfig, {
      componentName,
    });

    await fs.promises.mkdir(path.dirname(outputFilePath), { recursive: true });
    await fs.promises.writeFile(outputFilePath, componentCode);

    return {
      filePath: relativePath,
      componentName,
      outputPath: path.dirname(relativePath),
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error processing ${filePath}: ${error.message}`);
    } else {
      console.error(`Error processing ${filePath}: Unknown error`);
    }

    return null;
  }
}
