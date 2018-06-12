import { ExpressionLexer } from "./ExpressionLexer/ExpressionLexer";
import { Token } from "./ExpressionLexer/Token";
import { SyntaxTree } from "./SyntaxTree/SyntaxTree";
import { EvaluationTree } from "./EvaluationTree/EvaluationTree";

export class ExpressionParser {
	private syntaxTree : SyntaxTree;
	public evaluationTree : EvaluationTree;
	private variableTree : EvaluationTree;
	constructor(expression: string) {
		let lexer : ExpressionLexer = new ExpressionLexer(expression);
		let tokens : Array<Token> = lexer.lex();
		this.syntaxTree = new SyntaxTree(tokens);
		this.syntaxTree.build();
	}

	public evaluate(variableExpression: string): string {
		if (variableExpression.length > 0) {
			let variableParser = new ExpressionParser(variableExpression);
			variableParser.evaluate("");
			this.variableTree = variableParser.evaluationTree;
			this.evaluationTree = new EvaluationTree(this.syntaxTree, this.variableTree);
		} else {
			this.evaluationTree = new EvaluationTree(this.syntaxTree, null);
		}
		return this.evaluationTree.evaluate();
	}
}