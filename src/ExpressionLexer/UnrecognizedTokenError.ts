export class UnrecognizedTokenError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "UnrecognizedTokenError";
	}
}