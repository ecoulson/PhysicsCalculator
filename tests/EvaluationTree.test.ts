import { expect } from 'chai';
import { ExpressionLexer } from '../src/ExpressionLexer/ExpressionLexer';
import { SyntaxTree } from '../src/SyntaxTree/SyntaxTree';
import { EvaluationTree } from '../src/EvaluationTree/EvaluationTree';
import { Token } from '../src/ExpressionLexer/Token';
import { readInputFile } from './Helpers/InputHelper';
const config = readInputFile("EvaluationTreeInputs");
const inputs = config.cases;
const variable = config.variable;

describe("EvaluationTree test suite", () => {
	for (let i = 0; i < inputs.length; i++) {
		it(`Should evaluate ${inputs[i].in} to ${inputs[i].out}`, () => {
			let lexer : ExpressionLexer = new ExpressionLexer(inputs[i].in);
			let tokens : Array<Token> = lexer.lex();
			let tree : SyntaxTree = new SyntaxTree(tokens);
			tree.build();
			let evaluationTree = new EvaluationTree(tree);
			expect(evaluationTree.evaluateValue(variable)).to.equal(inputs[i].out);
		})
	}
});