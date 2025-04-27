import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { cosmiconfigSync } from 'cosmiconfig';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import { processSvgFile } from './utils/processSvgFile';
import { generateIndexFiles } from './utils/generateIndexFiles';

// CLI arguments configuration
const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 [options]')
  .option('input', {
    alias: 'i',
    describe: 'Input directory containing SVG files',
    type: 'string',
    demandOption: true,
  })
  .option('output', {
    alias: 'o',
    describe: 'Output directory for React components',
    type: 'string',
    demandOption: true,
  })
  .option('config', {
    alias: 'c',
    describe: 'Path to SVGR config file',
    type: 'string',
  })
  .help()
  .alias('help', 'h')
  .parseSync();

// Load SVGR config if provided
let svgrConfig = {};

if (argv.config) {
  try {
    const explorer = cosmiconfigSync('svgr');
    const result = explorer.load(argv.config);
    if (result) {
      svgrConfig = result.config;
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error loading SVGR config: ${error.message}`);
    } else {
      console.error('Error loading SVGR config: Unknown error');
    }

    process.exit(1);
  }
} else {
  throw new Error('SVGR config file is required');
}

// Main function
async function main() {
  const inputDir = path.resolve(argv.input);
  const outputDir = path.resolve(argv.output);

  // Check if input directory exists
  try {
    await fs.promises.access(inputDir, fs.constants.R_OK);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(
        `Input directory does not exist or is not readable: ${inputDir}`,
      );
    } else {
      console.error('Error accessing input directory: Unknown error');
    }

    process.exit(1);
  }

  console.log(
    `Converting SVG files from ${inputDir} to React components in ${outputDir}`,
  );

  try {
    // Find all SVG files in the input directory and subdirectories
    const svgFiles = glob.sync(`${inputDir}/**/*.svg`);

    if (svgFiles.length === 0) {
      console.warn(`No SVG files found in ${inputDir}`);
      process.exit(0);
    }

    console.log(`Found ${svgFiles.length} SVG files`);

    // Process each SVG file
    const processedFiles = await Promise.all(
      svgFiles.map((file) =>
        processSvgFile(file, inputDir, outputDir, svgrConfig),
      ),
    );
    const existsFiles = processedFiles.filter((file) => file !== null);

    if (existsFiles.length === 0) {
      console.warn(`No valid SVG files found in ${inputDir}`);
      process.exit(0);
    }

    await generateIndexFiles(existsFiles, outputDir);

    console.log(
      `Successfully converted ${
        processedFiles.filter(Boolean).length
      } SVG files`,
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    }

    process.exit(1);
  }
}

main();
