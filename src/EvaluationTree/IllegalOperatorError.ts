export class IllegalOperatorError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "IllegalOperatorError";
	}
}