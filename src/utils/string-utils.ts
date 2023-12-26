export const toSentenceCase = (value: string) => {
	// Split the text into sentences using a regular expression
	const sentences = value.split(/(?<=[.!?])\s/);

	// Convert each sentence to sentence case
	return sentences.map(sentence =>
		sentence.charAt(0).toUpperCase() + sentence.slice(1).toLowerCase()
	).join(' ');
}
