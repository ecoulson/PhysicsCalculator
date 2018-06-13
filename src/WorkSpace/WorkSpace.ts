import { ExpressionParser } from "../ExpressionParser/ExpressionParser";
import { SyntaxNode } from "../ExpressionParser/SyntaxTree/SyntaxNode";
import { EvaluationTree } from "../ExpressionParser/EvaluationTree/EvaluationTree";

export class WorkSpace {
	private formulaMapping : { [variable: string]: ExpressionParser}

	constructor() {
		this.formulaMapping = {};
		this.defineConstants();
	}

	private defineConstants(): void {
		this.defineFormula(`e=${Math.E.toString()}`);
		this.defineFormula(`\\pi=${Math.PI.toString()}`);
		this.defineFormula(`g=9.8m/s^2`);
	}

	public defineFormula(formula: string) {
		let formulaParts : Array<string> = formula.split('=');
		let variable : string = formulaParts[0].trim();
		let expression : string = formulaParts[1].trim();
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

	public clear():void {
		this.formulaMapping = {};
		this.defineConstants();
	}
}