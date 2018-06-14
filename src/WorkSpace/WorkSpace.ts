import { ExpressionParser } from "../ExpressionParser/ExpressionParser";
import { SyntaxNode } from "../ExpressionParser/SyntaxTree/SyntaxNode";
import { EvaluationTree } from "../ExpressionParser/EvaluationTree/EvaluationTree";

export class WorkSpace {
	private formulaMapping : { [variable: string]: ExpressionParser}
	private functionMapping: { [name: string]: Function }

	constructor() {
		this.formulaMapping = {};
		this.functionMapping = {};
		this.defineConstants();
		this.defineFunctions();
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

	private defineFunctions(): void {
		this.functionMapping["sqrt"] = (x:number) => {
			return Math.sqrt(x);
		}
		this.functionMapping["abs"] = (x:number) => {
			return Math.abs(x);
		}
		this.functionMapping["acos"] = (x:number) => {
			return this.toDegrees(Math.acos(x))
		}
		this.functionMapping["asin"] = (x:number) => {
			return this.toDegrees(Math.asin(x))
		}
		this.functionMapping["atan"] = (x:number) => {
			return this.toDegrees(Math.atan(x))
		}
		this.functionMapping["cos"] = (x:number) => {
			return Math.cos(this.toRadians(x));
		}
		this.functionMapping["sin"] = (x:number) => {
			return Math.sin(this.toRadians(x));
		}
		this.functionMapping["tan"] = (x:number) => {
			return Math.tan(this.toRadians(x));
		}
		this.functionMapping["exp"] = (x:number) => {
			return Math.exp(x);
		}
		this.functionMapping["log"] = (x:number) => {
			return Math.log(x);
		}
	}

	private toDegrees(x: number) {
		return x * 180 / Math.PI;
	}

	private toRadians(x: number) {
		return x * Math.PI / 180;
	}

	public hasFormula(variable: string): boolean {
		return this.formulaMapping.hasOwnProperty(variable);
	}

	public hasFunction(name: string): boolean {
		return this.functionMapping.hasOwnProperty(name);
	}

	public getFormula(variable: string): EvaluationTree {
		return this.formulaMapping[variable].evaluationTree;
	}

	public getFunction(name: string): Function {
		return this.functionMapping[name];
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