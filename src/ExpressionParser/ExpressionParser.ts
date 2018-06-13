import { ExpressionLexer } from "./ExpressionLexer/ExpressionLexer";
import { Token } from "./ExpressionLexer/Token";
import { SyntaxTree } from "./SyntaxTree/SyntaxTree";
import { EvaluationTree } from "./EvaluationTree/EvaluationTree";
import { WorkSpace } from "../WorkSpace/WorkSpace";

export class ExpressionParser {
	private syntaxTree : SyntaxTree;
	public evaluationTree : EvaluationTree;

	constructor(expression: string, workspace: WorkSpace) {
		let lexer : ExpressionLexer = new ExpressionLexer(expression);
		let tokens : Array<Token> = lexer.lex();
		this.syntaxTree = new SyntaxTree(tokens);
		this.syntaxTree.build();
		this.evaluationTree = new EvaluationTree(this.syntaxTree, workspace);
	}

	public evaluate(): string {
		return this.evaluationTree.evaluate();
	}
}