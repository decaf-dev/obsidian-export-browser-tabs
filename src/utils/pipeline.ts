export const pipeline = (...functions: Function[]) => {
	return function (initialValue: unknown) {
		return functions.reduce((accumulator, currentFunction) => {
			return currentFunction(accumulator);
		}, initialValue);
	};
}
