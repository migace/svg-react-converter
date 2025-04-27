# SVG React Converter

A command-line tool for converting SVG files into React components using SVGR, with support for directory structure preservation and SVG optimization.

## Features

- Converts SVG files to TypeScript React components
- Preserves directory structure
- Generates index.ts files for easy importing
- Supports SVGR configuration file
- Optimizes SVGs using SVGO
- Customizable output directory

## Installation

```bash
# Clone the repository
git clone https://github.com/migace/svg-react-converter.git
cd svg-react-converter

# Install dependencies
npm install
```

## Usage

```bash
# Basic usage
node src/app.js --input ./path/to/svg/files --output ./path/to/output

# With custom SVGR config
node src/app.js --input ./path/to/svg/files --output ./path/to/output --config ./svgr.config.js
```

### Command Line Options

| Option | Alias | Description | Required |
|--------|-------|-------------|----------|
| --input | -i | Input directory containing SVG files | Yes |
| --output | -o | Output directory for React components | Yes |
| --config | -c | Path to SVGR config file | No |
| --help | -h | Show help | No |

## SVGR Configuration

File: `svgr.config.js`:

## Output Structure

The tool will:

1. Convert each SVG file to a React component (.tsx)
2. Maintain the same directory structure as the input
3. Generate an index.ts file in each directory exporting all components in that directory

Example:

Input:
```
/svg
  /common
    logo.svg
    icon.svg
  /social
    twitter.svg
    facebook.svg
```

Output:
```
/components
  /common
    LogoIcon.tsx
    IconIcon.tsx
    index.ts
  /social
    TwitterIcon.tsx
    FacebookIcon.tsx
    index.ts
```

The index.ts files will contain exports for all components in their respective directories:

```typescript
// /components/common/index.ts
export { default as LogoIcon } from './LogoIcon';
export { default as IconIcon } from './IconIcon';
```

## How to use

```
npm start
```

## License

MIT