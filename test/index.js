import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import * as mimer from '../src';

const lookup = suite('$.lookup');

lookup('exports', () => {
	assert.type(mimer.lookup, 'function');
});

lookup('returns :: found', () => {
	let output = mimer.lookup('txt');
	assert.type(output, 'string');
});

lookup('returns :: missing', () => {
	let output = mimer.lookup('404');
	assert.is(output, undefined);
});

lookup('format :: uppercase', () => {
	let output = mimer.lookup('TXT');
	assert.is(output, 'text/plain');
});

lookup('format :: leading dot', () => {
	let output = mimer.lookup('.txt');
	assert.is(output, 'text/plain');
});

lookup('format :: filename', () => {
	let output = mimer.lookup('foobar.txt');
	assert.is(output, 'text/plain');
});

lookup('format :: filepath', () => {
	let foo = mimer.lookup('foo/bar.txt');
	assert.is(foo, 'text/plain');

	let bar = mimer.lookup('C:\\\\hello\\\\world.html');
	assert.is(bar, 'text/html');
});

lookup('format :: non-string', () => {
	let output = mimer.lookup(123);
	assert.is(output, undefined);
});

lookup('format :: whitespace', () => {
	let output = mimer.lookup('  txt  ');
	assert.is(output, 'text/plain');
});

lookup.run();

// ---

const mimes = suite('$.mimes');

mimes('exports', () => {
	assert.type(mimer.mimes, 'object');
});

mimes('keys', () => {
	assert.ok(mimer.mimes['txt']);
	assert.ok(mimer.mimes['html']);
	assert.ok(mimer.mimes['htm']);
});

mimes('mutable', () => {
	let output = mimer.lookup('foobar');
	assert.is(output, undefined);

	mimer.mimes['foobar'] = 'hello';
	output = mimer.lookup('foobar');
	assert.is(output, 'hello');
});

mimes.run();
