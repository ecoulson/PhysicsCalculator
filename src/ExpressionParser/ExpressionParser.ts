import { ExpressionLexer } from "./ExpressionLexer/ExpressionLexer";
import { Token } from "./ExpressionLexer/Token";
import { SyntaxTree } from "./SyntaxTree/SyntaxTree";
import { EvaluationTree } from "./EvaluationTree/EvaluationTree";
import { WorkSpace } from "../WorkSpace/WorkSpace";

export class ExpressionParser {
	private syntaxTree : SyntaxTree;
	public evaluationTree : EvaluationTree;
	private workspace : WorkSpace;

	constructor(expression: string, workspace: WorkSpace) {
		this.workspace = workspace;
		let lexer : ExpressionLexer = new ExpressionLexer(expression);
		let tokens : Array<Token> = lexer.lex();
		this.syntaxTree = new SyntaxTree(tokens);
		this.syntaxTree.build();
	}

	public evaluate(): string {
		this.evaluationTree = new EvaluationTree(this.syntaxTree, this.workspace);
		return this.evaluationTree.evaluate();
	}
}