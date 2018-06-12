export class IllegalUnitOperationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "IllegalUnitOperationError";
	}
}