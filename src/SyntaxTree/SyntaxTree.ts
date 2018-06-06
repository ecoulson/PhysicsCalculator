import { Token } from "../ExpressionLexer/Token";
import { SyntaxNode } from "../SyntaxTree/SyntaxNode";
import { NumberNode } from "./NumberNode";
import { TokenType } from "../ExpressionLexer/TokenType";
import { UnitNode } from "./UnitNode";
import { UnexpectedTokenError } from "./UnexpectedTokenError";
import { OperatorNode } from "./OperatorNode";

export class SyntaxTree {
	private tokens : Array<Token>;
	private offset : number;
	public root : SyntaxNode

	constructor(tokens: Array<Token>) {
		this.tokens = tokens;
		this.root = null;
		this.offset = 0;
	}

	private hasReadAllTokens(): boolean {
		return this.offset == this.tokens.length;
	}

	private isNextToken(type: TokenType): boolean {
		return this.tokens[this.offset].getTokenType() == type;
	}

	private readToken(): Token {
		return this.tokens[this.offset++];
	}

	public build(): void {
		this.root = this.readSums();
	}

	private readSums(): SyntaxNode {
		let node = this.readFactor();
		while (!this.hasReadAllTokens() && !this.isNextToken(TokenType.RightParentheses) && (this.isNextToken(TokenType.Add) || this.isNextToken(TokenType.Subtract))) {
			let operatorToken = this.readToken();
			let operatorNode = new OperatorNode(operatorToken);
			let rightNode = this.readFactor();
			operatorNode.left = node;
			operatorNode.right = rightNode;
			node = operatorNode;
		}
		return node;
	}

	private readFactor() : SyntaxNode {
		let node = this.readExponent();
		while (!this.hasReadAllTokens() && (this.isNextToken(TokenType.Multiply) || this.isNextToken(TokenType.Divide))) {
			let operatorToken = this.readToken();
			let operatorNode = new OperatorNode(operatorToken);
			let rightNode = this.readExponent();
			operatorNode.left = node;
			operatorNode.right = rightNode;
			node = operatorNode;
		}
		return node;
	}

	private readExponent() : SyntaxNode {
		let node = this.readParentheses();
		while (!this.hasReadAllTokens() && this.isNextToken(TokenType.Exponentiate)) {
			let operatorToken = this.readToken();
			let operatorNode = new OperatorNode(operatorToken);
			let rightNode = this.readParentheses();
			operatorNode.left = node;
			operatorNode.right = rightNode;
			node = operatorNode;
		}
		return node;
	}

	private readParentheses() : SyntaxNode {
		if (!this.hasReadAllTokens() && this.isNextToken(TokenType.LeftParentheses)) {
			this.readToken();
			let node = this.readSums();
			this.readToken();
			return node;
		} else {
			return this.readTerm();
		}
	}

	private readTerm() : SyntaxNode {
		let numberNode = this.readNumber();
		if (!this.hasReadAllTokens() && this.isNextToken(TokenType.Identifier)) {
			let unitNode = this.readComplexUnit();
			numberNode.right = unitNode;
		}
		return numberNode;
	}

	private readNumber(): SyntaxNode {
		let sign = 1;
		while (this.isNextToken(TokenType.Subtract)) {
			sign *= -1;
			this.readToken();
		}
		if (this.isNextToken(TokenType.Number)) {
			let numberToken = this.readToken();
			let signedValue = sign * parseFloat(numberToken.getData());
			numberToken.setData(signedValue.toString());
			return new NumberNode(numberToken);
		} else {
			let errorToken : Token = this.readToken();
			throw new UnexpectedTokenError(`Unexpected ${errorToken.getTokenType()} token at position ${errorToken.getPos()}`);
		}
	}

	private readComplexUnit(): SyntaxNode {
		let node : SyntaxNode = this.readExponentUnit();
		while (!this.hasReadAllTokens() && (this.isNextToken(TokenType.Divide) || this.isNextToken(TokenType.Multiply))) {
			let operatorToken = this.readToken();
			let operatorNode = new OperatorNode(operatorToken);
			let rightNode = this.readExponentUnit();
			operatorNode.left = node;
			operatorNode.right = rightNode;
			node = operatorNode;
		}
		return node;
	}

	private readExponentUnit(): SyntaxNode {
		let node : SyntaxNode = this.readSimpleUnit();
		while (!this.hasReadAllTokens() && this.isNextToken(TokenType.Exponentiate)) {
			let operatorToken = this.readToken();
			let operatorNode = new OperatorNode(operatorToken);
			let rightNode = this.readNumber();
			operatorNode.left = node;
			operatorNode.right = rightNode;
			node = operatorNode;
		}
		return node;
	}

	private readSimpleUnit(): SyntaxNode {
		if (this.isNextToken(TokenType.Identifier)) {
			let identifierToken = this.readToken();
			return new UnitNode(identifierToken);
		} else {
			let errorToken : Token = this.readToken();
			throw new UnexpectedTokenError(`Unexpected ${errorToken.getTokenType()} token at position ${errorToken.getPos()}`);
		}
	}
}