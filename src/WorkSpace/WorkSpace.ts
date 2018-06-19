import { ExpressionParser } from "../ExpressionParser/ExpressionParser";
import { SyntaxNode } from "../ExpressionParser/SyntaxTree/SyntaxNode";
import { EvaluationTree } from "../ExpressionParser/EvaluationTree/EvaluationTree";
import { NodeType } from "../ExpressionParser/SyntaxTree/NodeTypes";
import { NumberNode } from "../ExpressionParser/SyntaxTree/NumberNode";
import { UnitNode } from "../ExpressionParser/SyntaxTree/UnitNode";
import { OperatorNode } from "../ExpressionParser/SyntaxTree/OperatorNode";

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
		this.defineFormula(`\\epsilon_{o} = 8.85F/m * 10^-12`);
		this.defineFormula(`e = ${Math.E.toString()}`);
		this.defineFormula(`\\pi = ${Math.PI.toString()}`);
		this.defineFormula(`g = -9.8m/s^2`);
		this.defineFormula(`k = 9.0N*m^2/C^2 * 10^9`);
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
		let unitRoot : SyntaxNode = this.formulaMapping[variable].evaluationTree.unitRoot;
		return this.cloneResultUnit(unitRoot);
	}

	private cloneResultUnit(node: SyntaxNode): SyntaxNode {
		if (node == null) {
			return node;
		} else if (node.type == NodeType.Number) {
			let numberNode = <NumberNode>node;
			let newNumber = NumberNode.createNode(numberNode.number);
			return newNumber;
		} else if (node.type == NodeType.Unit) {
			let unitNode = <UnitNode>node;
			let newUnit = UnitNode.createNode(unitNode.unit);
			newUnit.degree = unitNode.degree;
			return newUnit;
		} else if (node.type == NodeType.Operator) {
			let operatorNode = <OperatorNode>node;
			let newOperator = OperatorNode.createNode(operatorNode.operator);
			newOperator.left = this.cloneResultUnit(node.left);
			newOperator.right = this.cloneResultUnit(node.right);
			return newOperator;
		} else {
			throw new Error("Illegal NodeType in UnitTree");
		}
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