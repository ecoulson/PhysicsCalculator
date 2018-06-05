import { Token } from "./Token";
import { TokenType } from "./TokenType";
import { UnrecognizedTokenError } from "./UnrecognizedTokenError";

const DIGIT_REGEX : RegExp = /\d/;
const LETTER_REGEX : RegExp = /^[a-zA-Z]+$/;
const WHITESPACE_REGEX : RegExp = /\s/;

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
			
			//disregard whitespace tokens
			if (token.getTokenType() != TokenType.Whitespace) {
				tokens.push(token);
			}
		}
		return tokens;
	}

	private isEndOfExpression(): boolean {
		return this.offset == this.expression.length;
	}

	private createToken(char: string): Token {		
		if (DIGIT_REGEX.test(char)) {
			return this.readNumberToken(char);
		} else if (LETTER_REGEX.test(char)) {
			return this.readIdentifierToken(char);
		} else if (WHITESPACE_REGEX.test(char)) {
			return new Token(TokenType.Whitespace, '', -1);
		} else {
			let pos : number = this.offset - 1;
			switch (char) {
				case '+':
					return new Token(TokenType.Add, '+', pos);
				case '-':
					return new Token(TokenType.Subtract, '-', pos);
				case '*':
					return new Token(TokenType.Multiply, '*', pos);
				case '/':
					return new Token(TokenType.Divide, '/', pos);
				case '^':
					return new Token(TokenType.Exponentiate, '^', pos);
				case '|':
					return new Token(TokenType.Absolute, '|', pos);
				case '(':
					return new Token(TokenType.LeftParentheses, '(', pos);
				case ')':
					return new Token(TokenType.RightParentheses, ')', pos);
				default:
					throw new UnrecognizedTokenError(`Unrecognized Token: ${char} at position ${pos}`);
			}
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

	private readIdentifierToken(char: string): Token {
		let pos : number = this.offset - 1;
		let identifier : string = char;
		while (!this.isEndOfExpression()) {
			identifier += this.expression[this.offset++];
		}
		return new Token(TokenType.Identifier, identifier, pos);
	}
}