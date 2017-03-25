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

1. [svgo](https://github.com/svg/svgo) available in PATH. Used to simplify SVG.
2. [scour](https://github.com/scour-project/scour) available in PATH. Used to remove redundancy from SVG.
3. [spritesheet-assembler](https://github.com/aslushnikov/spritesheet-assembler) to actually make spritesheets.
4. [node.js](https://nodejs.org/en/) available in PATH. Needed to generate devtools descriptors.

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
