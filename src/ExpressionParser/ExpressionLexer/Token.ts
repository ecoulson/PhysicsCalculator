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

	public getTokenType(): TokenType {
		return this.tokenType;
	}

	public getPos(): number {
		return this.pos;
	}

	public getData(): string {
		return this.data;
	}

	public setData(data: string) {
		this.data = data;
	} 
}