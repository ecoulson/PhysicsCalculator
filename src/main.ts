import { lex } from "./ExpressionLexer";

export function evaluate(expression: string): number {
	lex(expression);
	return 0;
}