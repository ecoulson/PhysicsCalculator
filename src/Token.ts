import { TokenType } from "./TokenType";

export class Token {
	private tokenType: TokenType;
	private pos: number; 

	Token(tokenType: TokenType, pos: number) {
		this.tokenType = tokenType;
	}

	getTokenType(): TokenType {
		return this.tokenType;
	}

	getPos(): number {
		return this.pos;
	}
}