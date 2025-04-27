#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
// Use glob directly with promises
const { glob } = require("glob");
// Use fs.promises.mkdir instead of mkdirp

const { transform } = require("@svgr/core");
const { cosmiconfigSync } = require("cosmiconfig");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

// CLI arguments configuration
const argv = yargs(hideBin(process.argv))
  .usage("Usage: $0 [options]")
  .option("input", {
    alias: "i",
    describe: "Input directory containing SVG files",
    type: "string",
    demandOption: true,
  })
  .option("output", {
    alias: "o",
    describe: "Output directory for React components",
    type: "string",
    demandOption: true,
  })
  .option("config", {
    alias: "c",
    describe: "Path to SVGR config file",
    type: "string",
  })
  .help()
  .alias("help", "h").argv;

// Load SVGR config if provided
let svgrConfig = {};
if (argv.config) {
  try {
    const explorer = cosmiconfigSync("svgr");
    const result = explorer.load(argv.config);
    if (result) {
      svgrConfig = result.config;
    }
  } catch (error) {
    console.error(`Error loading SVGR config: ${error.message}`);
    process.exit(1);
  }
} else {
  throw new Error("SVGR config file is required");
}

// Process an SVG file and convert it to a React component
async function processSvgFile(filePath, inputDir, outputDir) {
  const svgContent = await fs.promises.readFile(filePath, "utf8");
  const relativePath = path.relative(inputDir, filePath);
  const componentName = getComponentName(filePath);
  const outputFilePath = path.join(
    outputDir,
    path.dirname(relativePath),
    `${componentName}.tsx`
  );

  try {
    const componentCode = await transform(svgContent, svgrConfig, {
      componentName,
    });

    // Create directory if it doesn't exist
    await fs.promises.mkdir(path.dirname(outputFilePath), { recursive: true });
    await fs.promises.writeFile(outputFilePath, componentCode);

    return {
      filePath: relativePath,
      componentName,
      outputPath: path.dirname(relativePath),
    };
  } catch (error) {
    console.error(`Error processing ${filePath}: ${error.message}`);
    return null;
  }
}

// Generate a valid React component name from the file path
function getComponentName(filePath) {
  const baseName = path.basename(filePath, ".svg");

  // Convert kebab-case or snake_case to PascalCase
  return baseName
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

// Generate index.ts files for each directory
async function generateIndexFiles(processedFiles, outputDir) {
  // Group processed files by directory
  const filesByDir = processedFiles.reduce((acc, file) => {
    if (!file) return acc;

    const dirPath = file.outputPath;
    if (!acc[dirPath]) {
      acc[dirPath] = [];
    }
    acc[dirPath].push(file);
    return acc;
  }, {});

  // Generate index.ts for each directory
  for (const [dirPath, files] of Object.entries(filesByDir)) {
    const indexPath = path.join(outputDir, dirPath, "index.ts");
    const indexContent = files
      .map((file) => {
        const componentName = file.componentName;
        const fileName = path.basename(file.filePath, ".svg");
        return `export { default as ${componentName} } from './${fileName}';`;
      })
      .join("\n");

    await fs.promises.writeFile(indexPath, indexContent + "\n");
  }
}

// Main function
async function main() {
  const inputDir = path.resolve(argv.input);
  const outputDir = path.resolve(argv.output);

  // Check if input directory exists
  try {
    await fs.promises.access(inputDir, fs.constants.R_OK);
  } catch (error) {
    console.error(
      `Input directory does not exist or is not readable: ${inputDir}`
    );
    process.exit(1);
  }

  console.log(
    `Converting SVG files from ${inputDir} to React components in ${outputDir}`
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
      svgFiles.map((file) => processSvgFile(file, inputDir, outputDir))
    );

    // Generate index.ts files for each directory
    await generateIndexFiles(processedFiles.filter(Boolean), outputDir);

    console.log(
      `Successfully converted ${
        processedFiles.filter(Boolean).length
      } SVG files`
    );
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();
