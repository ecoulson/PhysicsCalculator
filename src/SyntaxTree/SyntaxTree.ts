import { Token } from "../ExpressionLexer/Token";
import { SyntaxNode } from "../SyntaxTree/SyntaxNode";
import { NumberNode } from "./NumberNode";
import { TokenType } from "../ExpressionLexer/TokenType";
import { UnitNode } from "./UnitNode";
import { UnexpectedTokenError } from "./UnexpectedTokenError";

export class SyntaxTree {
	private tokens : Array<Token>;
	private offset : number;
	public root : SyntaxNode

	constructor(tokens: Array<Token>) {
		this.tokens = tokens;
		this.root = null;
		this.offset = 0;
	}

	public build(): void {
		this.root = this.readSums();
	}

	private readSums(): SyntaxNode {
		let left = this.readNumber();
		return left;
	}

	private hasReadAllTokens(): boolean {
		return this.offset == this.tokens.length;
	}

	private readNumber() : SyntaxNode {
		let numberNode = this.readNode();
		if (!this.hasReadAllTokens() && this.isNextToken(TokenType.Identifier)) {
			let unitNode = this.readNode();
			numberNode.right = unitNode;
		}
		return numberNode;
	}

	private readNode(): SyntaxNode {
		if (this.isNextToken(TokenType.Number)) {
			let numberToken = this.readToken();
			return new NumberNode(numberToken);
		} else if (this.isNextToken(TokenType.Identifier)) {
			let unitToken = this.readToken();
			return new UnitNode(unitToken);
		} else {
			let errorToken : Token = this.readToken();
			throw new UnexpectedTokenError(`Unexpected ${errorToken.getTokenType()} token at position ${errorToken.getPos()}`);
		}
	}

	private isNextToken(type: TokenType): boolean {
		return this.tokens[this.offset].getTokenType() == type;
	}

	private readToken(): Token {
		return this.tokens[this.offset++];
	}
}