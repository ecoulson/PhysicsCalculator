import { expect } from 'chai';
import { ExpressionLexer } from '../src/ExpressionParser/ExpressionLexer/ExpressionLexer';
import { SyntaxTree } from '../src/ExpressionParser/SyntaxTree/SyntaxTree';
import { EvaluationTree } from '../src/ExpressionParser/EvaluationTree/EvaluationTree';
import { Token } from '../src/ExpressionParser/ExpressionLexer/Token';
import { readInputFile } from './Helpers/InputHelper';
import { checkTreeStructure, checkTreeSize, checkTreeValue } from './Helpers/SyntaxTreeHelper';
const config = readInputFile("EvaluationTreeInputs");
const valueEvalCases = config.evaluateValueCases;
const unitCases = config.unitCases;
const unitEvalCases = config.evaluateUnitCases;
const evalCases = config.evaluateCases;

describe("EvaluationTree Test Suite", () => {
	for (let i = 0; i < valueEvalCases.length; i++) {
		it(`Should evaluate ${valueEvalCases[i].in} to ${valueEvalCases[i].out}`, () => {
			let lexer : ExpressionLexer = new ExpressionLexer(valueEvalCases[i].in);
			let tokens : Array<Token> = lexer.lex();
			let tree : SyntaxTree = new SyntaxTree(tokens);
			tree.build();
			let evaluationTree = new EvaluationTree(tree, null);
			expect(evaluationTree.evaluateValue()).to.equal(valueEvalCases[i].out);
		})
	}
	for (let i = 0; i < unitCases.length; i++) {
		it(`Should build unit tree for ${unitCases[i].in}`, () => {
			let lexer : ExpressionLexer = new ExpressionLexer(unitCases[i].in);
			let tokens : Array<Token> = lexer.lex();
			let tree : SyntaxTree = new SyntaxTree(tokens);
			tree.build();
			let evaluationTree = new EvaluationTree(tree, null);
			let unitTree : SyntaxTree = new SyntaxTree([]);
			unitTree.root = evaluationTree.unitRoot;
			checkTreeStructure(unitTree, unitCases[i].structure);
			checkTreeSize(unitTree, unitCases[i].structure.length);
			checkTreeValue(unitTree, unitCases[i].values);
		})
	}
	for (let i = 0; i < unitEvalCases.length; i++) {
		it(`Should evaluate units ${unitEvalCases[i].in} to ${unitEvalCases[i].out}`, () => {
			let lexer : ExpressionLexer = new ExpressionLexer(unitEvalCases[i].in);
			let tokens : Array<Token> = lexer.lex();
			let tree : SyntaxTree = new SyntaxTree(tokens);
			tree.build();
			let evaluationTree = new EvaluationTree(tree, null);
			let unitStruct : string = evaluationTree.evaluateUnits();
			expect(unitStruct.toString()).to.equal(unitEvalCases[i].out);
		})
	}
	for (let i = 0; i < evalCases.length; i++) {
		it(`Should evaluate ${evalCases[i].in} to ${evalCases[i].out}`, () => {
			let lexer : ExpressionLexer = new ExpressionLexer(evalCases[i].in);
			let tokens : Array<Token> = lexer.lex();
			let tree : SyntaxTree = new SyntaxTree(tokens);
			tree.build();
			let evaluationTree = new EvaluationTree(tree, null);
			expect(evaluationTree.evaluate()).to.equal(evalCases[i].out);
		});
	}
});