import { ExpressionParser } from "../ExpressionParser/ExpressionParser";
import { SyntaxNode } from "../ExpressionParser/SyntaxTree/SyntaxNode";
import { EvaluationTree } from "../ExpressionParser/EvaluationTree/EvaluationTree";

export class WorkSpace {
	private formulaMapping : { [variable: string]: ExpressionParser}

	constructor() {
		this.formulaMapping = {};
	}

	public defineFormula(formula: string) {
		let formulaParts : Array<string> = formula.split('=');
		let variable : string = formulaParts[0];
		let expression : string = formulaParts[1];
		let parser : ExpressionParser = new ExpressionParser(expression, this);
		this.formulaMapping[variable] = parser;
	}

	public hasFormula(variable: string): boolean {
		return this.formulaMapping.hasOwnProperty(variable);
	}

	public getFormula(variable: string): EvaluationTree {
		return this.formulaMapping[variable].evaluationTree;
	}

	public getFormulaResultUnit(variable: string): SyntaxNode {
		return this.formulaMapping[variable].evaluationTree.unitRoot;
	}

	public evaluate(expression: string): string {
		let parser : ExpressionParser = new ExpressionParser(expression, this);
		return parser.evaluate();
	}
}