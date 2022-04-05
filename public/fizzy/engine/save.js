export function save(name, data) {
	localStorage.setItem(name, JSON.stringify(data));
	return true;
}
export function load(name) {
	return JSON.parse(localStorage.getItem(name));
}
export function remove(name) {
	localStorage.removeItem(name);
	return true;
}