// Merges translations/batches/<n>.txt ("<index>:<Belarusian>" per line, index into work/queue.json) into the dictionary.
const fs = require('fs');
const path = require('path');
const queue = require('../work/queue.json');
const dictPath = path.join(__dirname, '..', 'translations', 'dictionary.json');
const dict = JSON.parse(fs.readFileSync(dictPath, 'utf8'));
let added = 0;
for (const n of process.argv.slice(2)) {
	const lines = fs.readFileSync(path.join(__dirname, '..', 'translations', 'batches', `${n}.txt`), 'utf8').split(/\r?\n/);
	for (const line of lines) {
		if (!line.trim()) continue;
		const tab = line.indexOf(':');
		const idx = Number(line.slice(0, tab));
		const be = line.slice(tab + 1);
		if (tab < 0 || !Number.isInteger(idx) || !queue[idx] || !be) { console.error('skipped bad line:', line); continue; }
		const en = queue[idx];
		for (const ph of en.match(/\{\d+\}/g) || []) if (!be.includes(ph)) console.error(`placeholder ${ph} missing in #${idx}: ${en}`);
		dict[en] = be;
		added++;
	}
}
fs.writeFileSync(dictPath, JSON.stringify(dict, null, '\t'));
console.log(`added ${added}, dictionary now ${Object.keys(dict).length}`);
