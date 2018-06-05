import { TokenType } from "./TokenType";

export class Token {
	private tokenType: TokenType;
	private pos: number;
	private data: string;

	constructor(tokenType: TokenType, data: string, pos: number) {
		this.tokenType = tokenType;
		this.pos = pos;
		this.data = data;
	}

	getTokenType(): TokenType {
		return this.tokenType;
	}

	getPos(): number {
		return this.pos;
	}

	getData(): string {
		return this.data;
	}
}