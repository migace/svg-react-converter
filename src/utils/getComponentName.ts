import camelcase from 'camelcase';
import path from 'path';

/**
 * Converts a file path to a PascalCase component name.
 * For example, "my-icon.svg" becomes "MyIcon".
 *
 * @param {string} filePath - The file path of the SVG file.
 * @returns {string} - The PascalCase component name.
 */
export function getComponentName(filePath: string): string {
  const baseName = path.basename(filePath, '.svg');

  return baseName
    .split(/[-_]/)
    .map((part) => camelcase(part, { pascalCase: true }))
    .join('');
}
