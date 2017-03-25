### devtools-icon-extractor

This project is written specifically for the needs of https://codereview.chromium.org/2772153002/

### Motivation

Chrome Developer Tools have a need to re-arrange its icons into spritesheets by their size.
Every DevTools icon is represented by a position in spritesheet and size.

Oftentimes icons are larger then the actual image in SVG. These dimensions are not represented
in any way in SVG files - they're stored separately in Icon.js file. For this reason, moving
icons manually is almost impossible.

This project automates the process.

### Prerequisite

1. [node.js](https://nodejs.org/en/) available in PATH.
2. [svgo](https://github.com/svg/svgo) available in PATH. Used to simplify SVG.
3. [scour](https://github.com/scour-project/scour) available in PATH. Used to remove redundancy from SVG.
4. [spass](https://github.com/aslushnikov/spritesheet-assembler) available in PATH. Used to assemble spritesheets.

### How to use

1. Navigate to the [extractor page](https://aslushnikov.github.io/devtools-icon-extractor/)
2. Hit "extract" button.
3. Make sure all icons disappear from spritesheets, and there are no errors.
4. Hit "download icons" button. This will download `icons.zip` achive with all the icons and processing scripts.
5. Unzip the archive. Goto the `icons` folder.
6. Call `bash optimize.sh`. This will use **svgo** with a pre-made config and **scour** to optimize icons. Minimization 
   results will be saved under `svgo/` and `svgo+scour/` folders.
7. Call `bash mkspritesheets.sh svgo+scour/` to make spritesheets out of heavily-optimized svgo+scour icons. This will result
   in `large.svg/medium.svg/small.svg` files with spritesheets and `large.json/medium.json/small.json` descriptors.
8. Call `node gen-devtools-icons.js` to generate all the devtools descriptors.

### Notes

1. Using Web technologies to extract icons is the only viable option: browser has the most correct SVG renderer and API to traverse SVG and access SVG node locations (via `getBoundingClientRects()`)
2. Since we don't know which gradient belongs to which icon (and it's tiring to parse SVG attributes), every icon is populated with all the definitions from the parent stylesheets. This implies the necessity of using **svgo** and **scour** to post-process results and remove redundancy.
3. Certain svgo optimizations turned out to be destructive for SVG rendering. Custom [svgo config](https://github.com/aslushnikov/devtools-icon-extractor/blob/master/svgoconfig.yml) was done to keep rendering valid.
4. Generating spritesheets out of SVGs with an easy-to-process icon descriptors was hard. Explored solutions either didn't handle SVGs or didn't allow to easily post-process icon descriptors. This was solved by [spritesheet-assembler](https://github.com/aslushnikov/spritesheet-assembler).
5. Generating inkscape-friendly SVGs turned out to be a pain: often times SVG was rendered correctly, but was misbehaving on
attempts to select/move icons or change svg size.
