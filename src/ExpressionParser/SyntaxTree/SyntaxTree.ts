import { Token } from "../ExpressionLexer/Token";
import { SyntaxNode } from "../SyntaxTree/SyntaxNode";
import { NumberNode } from "./NumberNode";
import { TokenType } from "../ExpressionLexer/TokenType";
import { UnitNode } from "./UnitNode";
import { UnexpectedTokenError } from "./UnexpectedTokenError";
import { OperatorNode } from "./OperatorNode";
import { VariableNode } from "./VariableNode";
import { InvokeNode } from "./InvokeNode";
import { AbsoluteNode } from "./AbsoluteNode";

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
		while (
			!this.hasReadAllTokens() && 
			!this.isNextToken(TokenType.Absolute) && 
			!this.isNextToken(TokenType.RightParentheses) && 
			(this.isNextToken(TokenType.Add) || this.isNextToken(TokenType.Subtract))
		) {
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
		while (
			!this.hasReadAllTokens() && 
			(this.isNextToken(TokenType.Multiply) || 
			this.isNextToken(TokenType.Divide))
		) {
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
		} else if (!this.hasReadAllTokens() && this.isNextToken(TokenType.Absolute)) {
			this.readToken();
			let node = new AbsoluteNode();
			let expression = this.readSums();
			node.right = expression;
			this.readToken();
			return node;
		} else {
			return this.readTerm();
		}
	}

	private readTerm() : SyntaxNode {
		let signToken : Token = this.readSign();
		if (!this.hasReadAllTokens() && this.isNextToken(TokenType.Number)) {
			let numberNode = this.readNumber(signToken);
			numberNode = this.addUnits(numberNode);
			return numberNode;
		} else if (!this.hasReadAllTokens() && this.isNextToken(TokenType.Identifier)) {
			let node : SyntaxNode = this.readVariable();
			node = this.transformNodeIfInvoke(node);
			node = this.transformNodeIfNegative(node, signToken);
			return node;
		} else if (!this.hasReadAllTokens()) {
			let token = this.readToken();
			throw new UnexpectedTokenError(`Unexpected token type ${token.getTokenType()} at position ${token.getPos()}`);
		} else {
			throw new Error("Out of Tokens");
		}
	}

	private readSign() : Token {
		let sign = 1;
		let pos = this.offset;
		while (!this.hasReadAllTokens() && this.isNextToken(TokenType.Subtract)) {
			sign *= -1;
			this.readToken();
		}
		return new Token(TokenType.Number, sign.toString(), pos);
	}

	private readNumber(sign: Token): SyntaxNode {
		if (this.isNextToken(TokenType.Number)) {
			let numberToken = this.readToken();
			let signedValue = parseInt(sign.getData()) * parseFloat(numberToken.getData());
			numberToken.setData(signedValue.toString());
			return new NumberNode(numberToken, true);
		} else {
			let errorToken : Token = this.readToken();
			throw new UnexpectedTokenError(`Unexpected ${errorToken.getTokenType()} token at position ${errorToken.getPos()}`);
		}
	}

	private addUnits(node: SyntaxNode): SyntaxNode {
		let numberNode = <NumberNode>node;
		if (!this.hasReadAllTokens() && this.isNextToken(TokenType.Identifier)) {
			let unitNode : SyntaxNode = this.readComplexUnit();
			node.right = unitNode;
			numberNode.isDimensionless = false;
			return node;
		} else {
			return node;
		}
	}

	private readVariable() : SyntaxNode {
		if (this.isNextToken(TokenType.Identifier)) {
			let variableToken : Token = this.readToken();
			return new VariableNode(variableToken);
		} else {
			let errorToken : Token = this.readToken();
			throw new UnexpectedTokenError(`Unexpected ${errorToken.getTokenType()} token at position ${errorToken.getPos()}`);
		}
	}

	private transformNodeIfInvoke(node : SyntaxNode) : SyntaxNode {
		if (!this.hasReadAllTokens() && this.isNextToken(TokenType.LeftParentheses)) {
			this.readToken();
			let invokeNode : SyntaxNode = new InvokeNode();
			let invokeExpression : SyntaxNode = this.readSums();
			invokeNode.left = node;
			invokeNode.right = invokeExpression;
			node = invokeNode;
			this.readToken();
			return node;
		} else {
			return node;
		}
	}

	private transformNodeIfNegative(node : SyntaxNode, sign: Token) : SyntaxNode {
		if (sign.getData() == "-1") {
			let signToken : Token = new Token(TokenType.Multiply, "*", sign.getPos());
			let signOperatorNode : SyntaxNode = new OperatorNode(signToken);
			let numberToken : Token = new Token(TokenType.Number, "-1", -1);
			signOperatorNode.left = new NumberNode(numberToken, true);
			signOperatorNode.right = node;
			node = signOperatorNode;
			return node;
		} else {
			return node;
		}
	}

	private readComplexUnit(): SyntaxNode {
		let node : SyntaxNode = this.readExponentUnit();
		while (
			!this.hasReadAllTokens() && 
			(this.isNextToken(TokenType.Divide) || 
			this.isNextToken(TokenType.Multiply)) && 
			this.tokens[this.offset + 1].getTokenType() != TokenType.Number &&
			this.tokens[this.offset + 1].getTokenType() != TokenType.LeftParentheses
		) {
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
			let sign = this.readSign();
			let rightNode = this.readNumber(sign);
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