document.addEventListener('DOMContentLoaded', onDOMLoaded);

var editor;
var icons = new Map();
var iconErrors = new Map();

function onDOMLoaded() {
  var container = document.querySelector('.descriptors div');
  document.querySelector('#extract-button').addEventListener('click', extractIcons, false);
  editor = CodeMirror(container);

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
  Promise.all(promises).then(extractIcons);
}

function extractIcons() {
  resetRendering();

  var descriptors;
  try {
    descriptors = eval('(' + editor.getValue() + ')');
  } catch (e) {
    alert('Error parsing descriptors: ' + e);
    return;
  }

  var inputs = document.querySelector('.inputs');
  iconErrors = new Map();
  icons = new Map();
  for (var name in descriptors) {
    var descriptor = descriptors[name];
    if (descriptor.transform) {
      iconErrors.set(name, 'Cannot extract icons with transforms');
      continue;
    }
    var svgRoot = inputs.querySelector('#' + descriptor.spritesheet);
    svgRoot = svgRoot ? svgRoot.contentDocument : null;
    svgRoot = svgRoot ? svgRoot.querySelector('svg') : null;
    if (!svgRoot) {
      iconErrors.set(name, 'Failed to find icon spritesheet!');
      continue;
    }

    var svg = extractIcon(svgRoot, descriptor);
    if (!svg.childNodes.length) {
      iconErrors.set(name, 'Failed to find icon in the stylesheet (is there any?)');
      continue;
    }
    icons.set(name, svg);
  }
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

function extractIcons2(svgRoot, spritesheet) {
  var commands = [];
  for (var name in UI.Icon.Descriptors) {
    var d = UI.Icon.Descriptors[name];
    if (d.spritesheet !== spritesheet || d.transform)
      continue;
    var svgText = extractIcon(svgRoot, d).outerHTML;
    var fileName = name + '.svg';
    commands.push(`touch ${fileName}`);
    commands.push(`echo '${svgText}' > ${fileName}`);
  }
  //copy(commands.join(';'));
}

function extractIcon(svgRoot, d) {
  var iconSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  iconSvg.setAttribute('viewBox', `${-d.x} ${-d.y} ${d.width} ${d.height}`);
  iconSvg.setAttribute('width', d.width);
  iconSvg.setAttribute('height', d.height);
  iconSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
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
  if (rect.left >= x && rect.left + rect.width <= x + w &&
    rect.top >= y && rect.top + rect.height <= y + h) {
    var node = document.importNode(node, true);
    container.appendChild(node);
    return;
  }
  var children = Array.prototype.slice.call(node.children);
  for (var child of children)
    copyNodesInRegion(x, y, w, h, container, child);
}

// extractIcons(document.querySelector('svg'), 'smallicons');
//extractIcons('resourceicons');
//extractIcon(UI.Icon.Descriptors['smallicon-inline-breakpoint-conditional']);
//extractIcon(UI.Icon.Descriptors['smallicon-thick-left-arrow']);