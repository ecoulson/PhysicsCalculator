export class UnexpectedTokenError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "UnexpectedTokenError";
	}
}