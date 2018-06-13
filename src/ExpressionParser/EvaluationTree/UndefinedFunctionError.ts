export class UndefinedFunctionError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "UndefinedFunctionError";
	}
}