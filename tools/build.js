// Applies translations/dictionary.json (English text -> Belarusian) to every module of the English base
// and writes translations/main.i18n.json. Keys without a translation are left out, so VS Code falls back to English.
//
// Menu labels carry "&&" mnemonics whose position differs per item ("Open &&File...", "E&&xit"), so besides an
// exact match the lookup also works on the label without "&&"; the mnemonic is then put on the first letter.
const fs = require('fs');
const path = require('path');

const base = require('../work/base-en.json').contents;
const dictionary = require('../translations/dictionary.json');

const strip = s => s.replace(/&&/g, '');
const plain = new Map();
for (const [en, be] of Object.entries(dictionary)) {
	if (!plain.has(strip(en))) plain.set(strip(en), strip(be));
}

function withMnemonic(text) {
	const m = /[\p{L}]/u.exec(text);
	return m ? text.slice(0, m.index) + '&&' + text.slice(m.index) : text;
}

function translate(english) {
	if (typeof english !== 'string') return undefined;
	if (dictionary[english] !== undefined) return dictionary[english];
	if (english.includes('&&')) {
		const be = plain.get(strip(english));
		if (be !== undefined) return withMnemonic(be);
	}
	return undefined;
}

const contents = {};
let translated = 0;
let total = 0;
for (const [moduleId, entries] of Object.entries(base)) {
	const out = {};
	for (const [key, english] of Object.entries(entries)) {
		total++;
		const be = translate(english);
		if (be !== undefined && be !== english) {
			out[key] = be;
			translated++;
		}
	}
	if (Object.keys(out).length) contents[moduleId] = out;
}

fs.writeFileSync(
	path.join(__dirname, '..', 'translations', 'main.i18n.json'),
	JSON.stringify({ version: '1.0.0', contents }, null, '\t')
);
console.log(`translated ${translated} of ${total} strings (${(translated / total * 100).toFixed(1)}%) in ${Object.keys(contents).length} modules`);
console.log(`dictionary entries: ${Object.keys(dictionary).length}`);

// Strings still missing, most frequent first, for the next translation pass (skipping chat/agent modules).
const freq = new Map();
for (const [moduleId, entries] of Object.entries(base)) {
	if (moduleId.startsWith('vs/sessions/') || moduleId.includes('/chat/') || moduleId.includes('agentHost')) continue;
	for (const english of Object.values(entries)) {
		if (typeof english !== 'string' || translate(english) !== undefined || !/\p{L}{2}/u.test(english)) continue;
		const key = strip(english);
		freq.set(key, (freq.get(key) || 0) + 1);
	}
}
const todo = [...freq.entries()].sort((a, b) => b[1] - a[1]).map(([s]) => s);
fs.writeFileSync(path.join(__dirname, '..', 'work', 'todo.json'), JSON.stringify(todo, null, '\t'));
console.log(`untranslated unique strings outside chat/agent: ${todo.length}`);
