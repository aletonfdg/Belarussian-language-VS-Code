// Builds an English base (module -> key -> text) from the strings bundled in a local VS Code install.
// Usage: node tools/extract-en.js "<path to VS Code resources/app>"
const fs = require('fs');
const path = require('path');

const appDir = process.argv[2];
if (!appDir) {
	console.error('Usage: node tools/extract-en.js "<VS Code resources/app dir>"');
	process.exit(1);
}

const keys = JSON.parse(fs.readFileSync(path.join(appDir, 'out', 'nls.keys.json'), 'utf8'));
const messages = JSON.parse(fs.readFileSync(path.join(appDir, 'out', 'nls.messages.json'), 'utf8'));

const contents = {};
let index = 0;
for (const [moduleId, moduleKeys] of keys) {
	const entry = {};
	for (const k of moduleKeys) {
		const name = typeof k === 'string' ? k : k.key;
		entry[name] = messages[index++];
	}
	contents[moduleId] = entry;
}

if (index !== messages.length) {
	console.error(`Mismatch: consumed ${index} keys but there are ${messages.length} messages`);
	process.exit(1);
}

const outDir = path.join(__dirname, '..', 'work');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'base-en.json'), JSON.stringify({ version: '1.0.0', contents }, null, '\t'));

const stats = Object.entries(contents)
	.map(([id, e]) => [id, Object.keys(e).length])
	.sort((a, b) => b[1] - a[1]);
console.log(`modules: ${stats.length}, strings: ${index}`);
console.log('largest modules:');
for (const [id, n] of stats.slice(0, 15)) console.log(`  ${n}\t${id}`);
