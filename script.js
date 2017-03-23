document.addEventListener('DOMContentLoaded', onDOMLoaded);

var editor;
var descriptors = {};
var icons = new Map();
var iconErrors = new Map();

function saveZip() {
    if (!icons.size) {
        alert('There are no icons to save.');
        return;
    }
    var zip = new JSZip();
    var folder = zip.folder('results');
    folder.file('smallIcons.svg', getSpriteSheetSVG('smallicons').outerHTML);
    folder.file('resourceGlyphs.svg', getSpriteSheetSVG('resourceicons').outerHTML);
    folder.file('toolbarButtonGlyphs.svg', getSpriteSheetSVG('largeicons').outerHTML);
    folder = folder.folder('icons');
    for (var name of icons.keys()) {
        var svgText = icons.get(name).outerHTML;
        var fileName = name + '.svg';
        folder.file(fileName, svgText);
    }
    zip.generateAsync({type:"blob"}).then(function (blob) {
        saveAs(blob, "icons.zip");
    });
}


function onDOMLoaded() {
  var container = document.querySelector('.descriptors div');
  document.querySelector('#extract-button').addEventListener('click', extractIcons, false);
  editor = CodeMirror(container);

  document.querySelector('#savezip').addEventListener('click', saveZip);

  var loadPromise = fetch('icons.json')
    .then(response => response.text())
    .then(text => editor.setValue(text));

  var promises = [loadPromise];

  // Wait for all spritesheets to load.
  var objectsToLoad = document.querySelectorAll('.spritesheet object');
  for (var object of objectsToLoad) {
    var fulfill;
    var promise = new Promise(x => fulfill = x);
    object.addEventListener('load', fulfill);
    promises.push(promise);
  }
  //Promise.all(promises).then(extractIcons);
}

function getSpriteSheetSVG(spritesheet) {
    var inputs = document.querySelector('.inputs');
    var svgRoot = inputs.querySelector('#' + spritesheet);
    svgRoot = svgRoot ? svgRoot.contentDocument : null;
    svgRoot = svgRoot ? svgRoot.querySelector('svg') : null;
    return svgRoot;
}

function extractIcons() {
  resetRendering();

  try {
    descriptors = eval('(' + editor.getValue() + ')');
  } catch (e) {
    alert('Error parsing descriptors: ' + e);
    descriptors = {};
    return;
  }

  iconErrors = new Map();
  icons = new Map();
  var enableSmallIcons = document.querySelector('#checkbox_smallIcons').checked;
  document.querySelector('#checkbox_smallIcons').checked = false;
  var enableMediumIcons = document.querySelector('#checkbox_mediumIcons').checked;
  document.querySelector('#checkbox_mediumIcons').checked = false;
  var enableLargeIcons = document.querySelector('#checkbox_largeIcons').checked;
  document.querySelector('#checkbox_largeIcons').checked = false;
  var skippedDescriptors = {};
  for (var name in descriptors) {
    var descriptor = descriptors[name];
    if (descriptor.width <= 10 && descriptor.height <= 10) {
        if (!enableSmallIcons) {
            skippedDescriptors[name] = descriptor;
            continue;
        }
    } else if (descriptor.width === 28 && descriptor.height === 24) {
        if (!enableLargeIcons) {
            skippedDescriptors[name] = descriptor;
            continue;
        }
    } else {
        if (!enableMediumIcons) {
            skippedDescriptors[name] = descriptor;
            continue;
        }
    }

    if (descriptor.isMask)
        name = name + '-mask';
    if (descriptor.transform) {
      iconErrors.set(name, 'Cannot extract icons with transforms');
      skippedDescriptors[name] = descriptor;
      continue;
    }
    var svgRoot = getSpriteSheetSVG(descriptor.spritesheet);
    if (!svgRoot) {
      iconErrors.set(name, 'Failed to find icon spritesheet!');
      skippedDescriptors[name] = descriptor;
      continue;
    }

    var svg = extractIcon(svgRoot, descriptor);
    if (!svg.childNodes.length) {
      iconErrors.set(name, 'Failed to find icon in the stylesheet (is there any?)');
      skippedDescriptors[name] = descriptor;
      continue;
    }
    icons.set(name, svg);
  }

  var lines = [];
  for (var name in skippedDescriptors) {
    var d = skippedDescriptors[name];
    var parts = [
        `x: ${d.x}`,
        `y: ${d.y}`,
        `width: ${d.width}`,
        `height: ${d.height}`,
        `spritesheet: '${d.spritesheet}'`,
    ]
    if (d.isMask)
        parts.push(`isMask: ${d.isMask}`);
    var line = `  '${name}': {${parts.join(', ')}}`;
    lines.push(line);
  }
  var text = '{\n' + lines.join(',\n') + '\n}';
  editor.setValue(text);
  renderIcons();
}

function resetRendering()
{
  document.querySelector('.stats-extracted').textContent = 0;
  document.querySelector('.stats-failed').textContent = 0;
  var extractedIcons = document.querySelector('.extracted-icons');
  extractedIcons.innerHTML='';
  var failedIcons = document.querySelector('.failed-icons');
  failedIcons.innerHTML='';
}

function renderIcons() {
  document.querySelector('.stats-extracted').textContent = icons.size;
  document.querySelector('.stats-failed').textContent = iconErrors.size;
  var extractedIcons = document.querySelector('.extracted-icons');
  extractedIcons.innerHTML='';
  var failedIcons = document.querySelector('.failed-icons');
  failedIcons.innerHTML='';

  for (var name of icons.keys()) {
    var iconDiv = document.createElement('div');
    iconDiv.classList.add('icon');

    iconDiv.appendChild(icons.get(name));

    var iconTitle = document.createElement('div');
    iconTitle.classList.add('icon-title');
    iconTitle.textContent = name;
    iconDiv.appendChild(iconTitle);

    extractedIcons.appendChild(iconDiv);
  }

  for (var name of iconErrors.keys()) {
    var iconDiv = document.createElement('div');
    iconDiv.classList.add('icon-error');

    var failReason = document.createElement('div');
    failReason.classList.add('fail-reason');
    failReason.textContent = 'Error: ' + iconErrors.get(name);
    iconDiv.appendChild(failReason);

    var iconTitle = document.createElement('div');
    iconTitle.classList.add('icon-title');
    iconTitle.textContent = name;
    iconDiv.appendChild(iconTitle);

    failedIcons.appendChild(iconDiv);
  }
}

function extractIcon(svgRoot, d) {
  var iconSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  for (var attribute of svgRoot.attributes) {
    if (!attribute.name.startsWith('xmlns'))
      continue;
    iconSvg.setAttribute(attribute.name, attribute.value);
  }
  iconSvg.setAttribute('viewBox', `${-d.x} ${-d.y} ${d.width} ${d.height}`);
  iconSvg.setAttribute('width', d.width);
  iconSvg.setAttribute('height', d.height);
  iconSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  iconSvg.setAttribute('xmlns:inkscape', 'http://www.inkscape.org/namespaces/inkscape');
  var defs = svgRoot.querySelector('defs');
  if (defs) {
    var node = document.importNode(defs, true);
    iconSvg.appendChild(node);
  }

  copyNodesInRegion(-d.x, -d.y, d.width, d.height, iconSvg, svgRoot);
  return iconSvg;
}

function copyNodesInRegion(x, y, w, h, container, node) {
  var rect = node.getBoundingClientRect();
  if (gte(rect.left, x) && lte(rect.left + rect.width, x + w) &&
    gte(rect.top, y) && lte(rect.top + rect.height, y + h)) {
    var importedNode = document.importNode(node, true);
    container.appendChild(importedNode);
    if (rect.left !== 0 || rect.right !== 0 || rect.top !== 0 || rect.bottom !== 0 || rect.width !== 0 || rect.height !== 0)
        node.remove();
    return;
  }
  var children = Array.prototype.slice.call(node.children);
  for (var child of children)
    copyNodesInRegion(x, y, w, h, container, child);
}

var EPS = 0.1;
function lte(a, b) {
    return a - b < -EPS || Math.abs(a - b) < EPS;
}

function gte(a, b) {
    return a - b > EPS || Math.abs(a - b) < EPS;
}

