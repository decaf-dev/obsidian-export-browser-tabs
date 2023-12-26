export const toSentenceCase = (value: string) => {
	// Split the text into sentences using a regular expression
	const sentences = value.split(/(?<=[.!?])\s/);

	// Convert each sentence to sentence case
	return sentences.map(sentence => {
		// Split the sentence into words
		const words = sentence.split(' ');

		// Convert each word to the correct case
		const correctedWords = words.map((word, index) => {
			if (word.toLowerCase() === 'i') {
				return 'I'; // Always capitalize 'I'
			}
			return index === 0 ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word.toLowerCase();
		});

		// Rejoin the words into a sentence
		return correctedWords.join(' ');
	}).join(' ');
}
