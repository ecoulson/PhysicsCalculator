import { Token } from "../ExpressionLexer/Token";
import { SyntaxNode } from "../SyntaxTree/SyntaxNode";
import { NumberNode } from "./NumberNode";

export class SyntaxTree {
	private tokens : Array<Token>;
	public root : SyntaxNode

	constructor(tokens: Array<Token>) {
		this.tokens = tokens;
		this.root = null;
	}

	public build(): void {
		this.root = new NumberNode();
	}

	public 
}