export class UndefinedVariableError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "UndefinedVariableError";
	}
}