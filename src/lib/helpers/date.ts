export const toLocaleDate = (timestamp: number) => {
	const date = new Date(timestamp * 1000);
	const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };

	return date.toLocaleDateString('en', options);
};
