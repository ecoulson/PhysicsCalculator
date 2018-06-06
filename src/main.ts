import { ExpressionLexer } from "./ExpressionLexer/ExpressionLexer";
import { Token } from "./ExpressionLexer/Token";


export function evaluate(expression: string): number {
	let lexer : ExpressionLexer = new ExpressionLexer(expression);
	let tokens : Array<Token> = lexer.lex();
	return 0;
}