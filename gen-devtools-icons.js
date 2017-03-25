var fs = require('fs');

var spritesheetsNames = {
    'small': {
        cellWidth: 10,
        cellHeight: 10,
        padding: 10
    },
    'medium': {
        cellWidth: 16,
        cellHeight: 16,
        padding: 0
    },
    'large': {
        cellWidth: 28,
        cellHeight: 24,
        padding: 0
    }
};

var spritesheets = [];
for (var spritesheetName in spritesheetsNames) {
    if (fs.existsSync(spritesheetName + '.json')) {
        spritesheets.push(require('./' + spritesheetName + '.json'));
    }
}

var descriptors = [];
for (var spritesheet of spritesheets) {
    descriptors.push(`\n  // ${spritesheet.name} icons`);
    var spritesheetName = spritesheet.name + 'icons';
    for (var iconName in spritesheet.icons) {
        var icon = spritesheet.icons[iconName];
        var isMask = false;
        if (iconName.endsWith('-mask')) {
            isMask = true;
            iconName = iconName.substring(0, iconName.length - '-mask'.length);
        }
        var properties = [];
        properties.push(`x: ${icon.x}`);
        properties.push(`y: ${icon.y}`);
        properties.push(`width: ${icon.width}`);
        properties.push(`height: ${icon.height}`);
        properties.push(`spritesheet: '${spritesheetName}'`);
        if (isMask)
            properties.push(`isMask: ${isMask}`);
        var descriptor = `  '${iconName}': {${properties.join(', ')}},`;
        descriptors.push(descriptor);
    }
}

var js = `UI.Icon.Descriptors = {\n`;
js += descriptors.join('\n');
js += `\n};`;
console.log(js);
