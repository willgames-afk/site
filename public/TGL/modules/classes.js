export const MObjectClasses = {
	text: [
		'h1',
		'p'
	]
}


export function isSelector(tg) {
	var token = tg.next().value
	if (token.type == 'alphanumeric' && Object.keys(MObjectClasses).includes(token.value) && tg.next().value.type == 'ob') {
		return [true, ];
	}
}
export function isStyleRule(tg) {
	if (isSelector(tg)) {

	}
}