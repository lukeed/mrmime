// @ts-check
/// <reference types="node" />
import { join, dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import DB from 'mime-db';

const ROOT = resolve('.');

const input = join(ROOT, 'src/$index.ts');
const denomod = join(ROOT, 'deno/mod.ts');

function write(file: string, data: string) {
	let f = resolve(ROOT, file);
	fs.writeFileSync(f, data);
	console.log('~> "%s" created', file);
}

// iana > mimedb > apache > nginx
// https://github.com/jshttp/mime-types/blob/master/index.js#L156
const SOURCES = {
	nginx: 1,
	apache: 2,
	iana: 4,
};

function compare(prev: string, next: string): string {
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
	let s1 = SOURCES[DB[prev].source] || 3;
	let s2 = SOURCES[DB[next].source] || 3;
	if (s1 !== s2) return s2 > s1 ? next : prev;
	return prev.length >= next.length ? next : prev;
}

let dict = {};
let ignore = /[/](x-|vnd\.)/;

let mtype: string, arr: string[];
let i=0, extn: string, prev: string;

for (mtype in DB) {
	if (ignore.test(mtype)) continue;

	arr = DB[mtype].extensions || [];
	if (!arr.length) continue;

	for (i=0; i < arr.length; i++) {
		extn = arr[i];
		prev = dict[extn];

		if (prev && prev !== mtype) {
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
) + '\n';

let esm = content + 'export { mimes, lookup };\n';
let cjs = content + 'exports.mimes = mimes;\nexports.lookup = lookup;\n';

// build exports
write('index.mjs', esm);
write('index.js', cjs);

let denodir = dirname(denomod);
fs.existsSync(denodir) || fs.mkdirSync(denodir);

fs.copyFileSync('readme.md', join(denodir, 'readme.md'));
console.log('\n~> "deno/readme.md" created');

write('deno/mod.ts', esm.replace(
	'function lookup(extn) {',
	'function lookup(extn: string): string | undefined {',
).replace(
	'const mimes = {',
	'const mimes: Record<string, string> = {',
));

if (!process.env.CI) {
	try {
		spawnSync('deno', ['fmt', denomod], { cwd: ROOT });
		console.log('\n~> $ deno fmt "deno/mod.ts"');
	} catch (err) {
		console.log('[deno]', err.stack);
	}
}

fs.copyFileSync(denomod, 'src/index.ts');
console.log('\n~> "src/index.ts" created');
