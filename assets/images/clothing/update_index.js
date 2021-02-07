/* eslint-env node */
/* eslint @typescript-eslint/no-var-requires: "off" */

var fs = require('fs')

// Run using node update_index.js

var index_content = ''
index_content += '/* eslint-disable */\n'
fs.readdirSync(__dirname).forEach(file => {
  if (file.endsWith('.png')) {
    console.log(file)
    const name = file.substring(0, file.lastIndexOf('.'))
    index_content += `export const ${name} = require('./${file}');\n`
  }
})
index_content += '/* eslint-enable */\n'
fs.writeFileSync(__dirname + '/index.ts', index_content)