// @ts-check
const fs = require('fs');
const { join } = require('path');
const DB = require('mime-db');

const input = join(__dirname, '../src/$index.js');
const output = join(__dirname, '../src/index.js');

// iana > mimedb > apache > nginx
// https://github.com/jshttp/mime-types/blob/master/index.js#L156
const scores = { nginx: 1, apache: 2, iana: 4 };

/**
 * @param {string} prev
 * @param {string} next
 * @return {string}
 */
function compare(prev, next) {
	let [p1] = prev.split('/', 1);
	let [p2] = next.split('/', 1);

	if (p1 !== p2) {
		// font > application > text
		if (p1 === 'font') return prev;
		if (p2 === 'font') return next;
		if (p1 === 'application') return prev;
		if (p2 === 'application') return next;
	}
	// compare sources
	let s1 = scores[DB[prev].source] || 3;
	let s2 = scores[DB[next].source] || 3;
	if (s1 !== s2) return s2 > s1 ? next : prev;
	return prev.length >= next.length ? next : prev;
}

let dict = {};
let ignore = /[/](x-|vnd\.)/;

let mtype, arr;
let i=0, extn, prev;

for (mtype in DB) {
	if (ignore.test(mtype)) continue;

	arr = DB[mtype].extensions || [];
	if (!arr.length) continue;

	for (i=0; i < arr.length; i++) {
		extn = arr[i];
		prev = dict[extn];

		if (prev) {
			let msg = `Found existing "${extn}" value:`;
			msg += `\n   (prev) "${prev}"`;
			msg += `\n   (next) "${mtype}"`;
			mtype = compare(prev, mtype);
			msg += `\n   (keep) "${mtype}"`;
			process.stdout.write(msg + '\n\n');
		}

		dict[extn] = mtype;
	}
}

let content = fs.readFileSync(input, 'utf8').replace(
	'{}', JSON.stringify(dict, null, 2)
);

fs.writeFileSync(output, content);
console.log('~> "src/index.js" created');
