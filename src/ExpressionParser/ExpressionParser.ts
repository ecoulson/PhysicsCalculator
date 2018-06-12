import { ExpressionLexer } from "./ExpressionLexer/ExpressionLexer";
import { Token } from "./ExpressionLexer/Token";
import { SyntaxTree } from "./SyntaxTree/SyntaxTree";
import { EvaluationTree } from "./EvaluationTree/EvaluationTree";

export class ExpressionParser {
	constructor(expression: string) {
		let lexer : ExpressionLexer = new ExpressionLexer(expression);
		let tokens : Array<Token> = lexer.lex();
		let tree : SyntaxTree = new SyntaxTree(tokens);
		tree.build();
		let evaluationTree = new EvaluationTree(tree);
	}
}