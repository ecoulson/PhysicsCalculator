import { SyntaxNode } from "./SyntaxNode";
import { NodeType } from "./NodeTypes";
import { Token } from "../ExpressionLexer/Token";
import { TokenType } from "../ExpressionLexer/TokenType";
import { UnitNode } from "./UnitNode";
import { IllegalOperatorError } from "../EvaluationTree/IllegalOperatorError";

export class OperatorNode extends SyntaxNode {
	public operator: TokenType;
	public resultUnit: UnitNode;

	constructor(token: Token) {
		super(NodeType.Operator);
		this.operator = token.getTokenType();
	}

	public static createNode(operator: string) {
		let type = this.getOperatorType(operator);
		let token: Token = new Token(type, operator, -1);
		return new OperatorNode(token);
	}

	private static getOperatorType(operator: string) : TokenType {
		switch(operator) {
			case '+':
				return TokenType.Add;
			case '-':
				return TokenType.Subtract;
			case '*':
				return TokenType.Multiply
			case '/':
				return TokenType.Divide;
			case '^':
				return TokenType.Exponentiate;
			default:
				throw new IllegalOperatorError("Illegal Operator " + operator);
		}
	}

	public setResultUnit(unit : string ) {
		let token = new Token(TokenType.Identifier, unit, -1);
		this.resultUnit = new UnitNode(token);
	}
}