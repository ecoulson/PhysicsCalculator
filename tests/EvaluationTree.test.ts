import { expect } from 'chai';
import { ExpressionLexer } from '../src/ExpressionLexer/ExpressionLexer';
import { SyntaxTree } from '../src/SyntaxTree/SyntaxTree';
import { EvaluationTree } from '../src/EvaluationTree/EvaluationTree';
import { Token } from '../src/ExpressionLexer/Token';
import { readInputFile } from './Helpers/InputHelper';
import { checkTreeStructure, checkTreeSize, checkTreeValue } from './Helpers/SyntaxTreeHelper';
import { IllegalUnitOperationError } from '../src/EvaluationTree/IllegalUnitOperationError';
const config = readInputFile("EvaluationTreeInputs");
const arithmeticCases = config.cases;
const unitCases = config.unitCases;
const variable = config.variable;

describe("EvaluationTree Test Suite", () => {
	for (let i = 0; i < arithmeticCases.length; i++) {
		it(`Should evaluate ${arithmeticCases[i].in} to ${arithmeticCases[i].out}`, () => {
			let lexer : ExpressionLexer = new ExpressionLexer(arithmeticCases[i].in);
			let tokens : Array<Token> = lexer.lex();
			let tree : SyntaxTree = new SyntaxTree(tokens);
			tree.build();
			let evaluationTree = new EvaluationTree(tree);
			expect(evaluationTree.evaluateValue(variable)).to.equal(arithmeticCases[i].out);
		})
	}
	for (let i = 0; i < unitCases.length; i++) {
		it(`Should build unit tree for ${unitCases[i].in}`, () => {
			let lexer : ExpressionLexer = new ExpressionLexer(unitCases[i].in);
			let tokens : Array<Token> = lexer.lex();
			let tree : SyntaxTree = new SyntaxTree(tokens);
			tree.build();
			let evaluationTree = new EvaluationTree(tree);
			let unitTree : SyntaxTree = new SyntaxTree([]);
			unitTree.root = evaluationTree.unitRoot;
			checkTreeStructure(unitTree, unitCases[i].structure);
			checkTreeSize(unitTree, unitCases[i].structure.length);
			checkTreeValue(unitTree, unitCases[i].values);
		})
	}
});