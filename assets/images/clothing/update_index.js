var fs = require('fs');

// Run using node update_index.js

var index_content = ''
fs.readdirSync(__dirname).forEach(file => {
  if (file.endsWith('.png')) {
    console.log(file);
    let name = file.substring(0, file.lastIndexOf('.'));
    index_content += `export const ${name} = require('./${file}');\n`;
  }
});
fs.writeFileSync(__dirname + '/index.ts', index_content);