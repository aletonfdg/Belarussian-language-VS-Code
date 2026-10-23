// Freezes the list of strings to translate next (most frequent first) into work/queue.json. Run once.
const fs = require('fs');
const path = require('path');
const base = require('../work/base-en.json').contents;
const dict = require('../translations/dictionary.json');
const strip = s => s.replace(/&&/g, '');
const have = new Set(Object.keys(dict).map(strip));
const freq = new Map();
for (const [m, e] of Object.entries(base)) {
	if (m.startsWith('vs/sessions/') || m.includes('/chat/') || m.includes('agentHost')) continue;
	for (const v of Object.values(e)) {
		if (typeof v !== 'string' || !/\p{L}{2}/u.test(v) || v.length > 80) continue;
		const k = strip(v);
		if (!have.has(k)) freq.set(k, (freq.get(k) || 0) + 1);
	}
}
const queue = [...freq.entries()].sort((a, b) => b[1] - a[1] || a[0].length - b[0].length).slice(0, 2700).map(([s]) => s);
fs.writeFileSync(path.join(__dirname, '..', 'work', 'queue.json'), JSON.stringify(queue, null, '\t'));
console.log('queue size', queue.length);
