import { Token } from "./Token";
import { TokenType } from "./TokenType";

export class ExpressionLexer {
	private offset: number;
	private expression: string;

	constructor(expression: string) {
		this.offset = 0;
		this.expression = expression;
	}

	public lex(): Array<Token> {
		let tokens : Array<Token> = [];
		while(!this.isEndOfExpression()) {
			let ch = this.expression[this.offset++];
			let token : Token = this.createToken(ch);
			tokens.push(token);
		}
		return tokens;
	}

	private isEndOfExpression(): boolean {
		return this.offset == this.expression.length;
	}

	private createToken(char: string): Token {
		let pos = this.offset - 1;
		return new Token(TokenType.Number, "", pos);
	}
}