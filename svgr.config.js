module.exports = {
  plugins: ["@svgr/plugin-jsx", "@svgr/plugin-prettier"],
  // Setting to true makes the SVG render as an icon (1em size)
  icon: false,

  // Generate TypeScript files
  typescript: true,

  // Format code with Prettier
  prettier: true,

  memo: true,

  ref: true,

  // Use SVGO for optimization
  svgo: true,

  // SVGO configuration
  svgoConfig: {
    plugins: [
      {
        name: "preset-default",
        params: {
          overrides: {
            removeViewBox: false,
          },
        },
      },
      "removeComments",
      "removeMetadata",
      "removeEmptyAttrs",
      "removeEmptyText",
      "removeEmptyContainers",
      "removeUselessDefs",
      "sortAttrs",
      "removeXMLNS",
      "removeDoctype",
      "removeEditorsNSData",
      "removeUnknownsAndDefaults",
      "removeNonInheritableGroupAttrs",
    ],
  },

  // Template for generated component
  template: ({ componentName, jsx }, { tpl }) => {
    const code = tpl`
  import type { SVGProps } from "react";
  import { Ref, forwardRef, memo } from "react";

  const ${componentName} = (
    props: SVGProps<SVGSVGElement>,
    ref: Ref<SVGSVGElement>
  ) => (
    ${jsx}
  );

  const ForwardRef = forwardRef(${componentName});

  ForwardRef.displayName = "${componentName}";

  const Memo = memo(ForwardRef);

  export default Memo;
        `;
    return code;
  },
};
