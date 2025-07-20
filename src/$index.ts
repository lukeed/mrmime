const mimes = {};
const charsets = {};

function lookup(extn) {
	let tmp = ('' + extn).trim().toLowerCase();
	let idx = tmp.lastIndexOf('.');
	return mimes[!~idx ? tmp : tmp.substring(++idx)];
}

function charset(mimetype) {
	if (mimetype.startsWith('text/')) return 'UTF-8';
	return charsets[mimetype];
}
