// Functions for dealing with files

/** 
 * Makes an XMLHttpRequest (GET) for the file url specified. 
 * @param url - The url of the requested file
 * @param onload - function to be called once file is loaded.
 */
export function requestFile(url, onload) {
	var req = new XMLHttpRequest();
	req.addEventListener("load", onload);
	req.addEventListener("error", (e) => { console.error(e) });
	req.responseType = "text";
	req.open("GET", url, true);
	req.send();
}