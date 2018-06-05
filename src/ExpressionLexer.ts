import { Token } from "./Token";

export class ExpressionLexer {
	private offset: number;
	private expression: string;

	constructor(expression: string) {
		this.offset = 0;
		this.expression = expression;
	}

	lex(): Array<Token> {
		return null;
	}
}