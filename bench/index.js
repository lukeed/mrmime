const { Suite } = require('benchmark');
const fixtures = require('./fixtures');

console.log('Load times:');

console.time('mrmime');
const mrmime = require('mrmime');
console.timeEnd('mrmime');

console.time('mime/lite');
const lite = require('mime/lite');
console.timeEnd('mime/lite');

console.time('mime');
const mime = require('mime');
console.timeEnd('mime');

// ---

const contenders = {
	'mime': mime.getType,
	'mime/lite': lite.getType,
	'mrmime': mrmime.lookup,
};

function runner(item, fixture) {
	let maxlen = 0;

	console.log('\nValidation :: %s', item);
	Object.keys(contenders).forEach(name => {
		maxlen = Math.max(maxlen, name.length);

		try {
			let lib = contenders[name];
			for (let key in fixture) {
				let val = lib(key);
				if (val != fixture[key]) {
					throw new Error(`[${tmp}][${key}] got "${val}" expected ${fixture[key]}`);
				}
			}
			console.log('  ✔', name);
		} catch (err) {
			console.log('  ✘', name, `(FAILED @ "${err.message}")`);
		}
	});

	console.log('\nBenchmark :: %s', item);
	const bench = new Suite().on('cycle', e => {
		console.log('  ' + e.target);
	});

	maxlen += 4;

	Object.keys(contenders).forEach(name => {
		bench.add(name + ' '.repeat(maxlen - name.length), () => {
			for (let key in fixture) {
				contenders[name](key);
			}
		})
	});

	bench.run();
}

// ---

runner('plain', fixtures.group1);
runner('leading', fixtures.group2);
runner('filename', fixtures.group3);
