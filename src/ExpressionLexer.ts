import { Token } from "./Token";
import { TokenType } from "./TokenType";
import { UnrecognizedTokenError } from "./UnrecognizedTokenError";

const DIGIT_REGEX : RegExp = /\d/;

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
		if (DIGIT_REGEX.test(char)) {
			return this.readNumberToken(char);
		} else {
			let pos : number = this.offset - 1;
			// return new Token(TokenType.Number, "", this.offset - 1);
			throw new UnrecognizedTokenError(`Unrecognized Token: ${char} at position ${pos}`);
		}
	}

	private readNumberToken(char: string): Token {
		let pos : number = this.offset - 1;
		let number : string = char;
		while (!this.isEndOfExpression()) {
			number += this.expression[this.offset++];
		}
		return new Token(TokenType.Number, number, pos);
	}
}