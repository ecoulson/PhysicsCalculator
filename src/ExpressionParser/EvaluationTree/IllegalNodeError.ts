export class IllegalNodeError extends Error {
	constructor(message: string) {
		super(message);
		this.name == "IllegalNodeError";
	}
}