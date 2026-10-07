const mimes = {};

function lookup(extn) {
	let tmp = ('' + extn).trim().toLowerCase();
	let idx = tmp.lastIndexOf('.');
	tmp = !~idx ? tmp : tmp.substring(++idx);
	return Object.prototype.hasOwnProperty.call(mimes, tmp) ? mimes[tmp] : undefined;
}
