import { Token } from "./Token";

export class SyntaxTree {
	private tokens: Array<Token>;

	constructor(tokens: Array<Token>) {
		this.tokens = tokens;
	}
}