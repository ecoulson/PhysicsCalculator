import { Token } from "./Token";

namespace ExpressionEvaluator {
	export class SyntaxTree {
		private tokens: Array<Token>;
	
		constructor(tokens: Array<Token>) {
			this.tokens = tokens;
		}
	}
}