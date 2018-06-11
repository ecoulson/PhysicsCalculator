import { SyntaxTree } from "../SyntaxTree/SyntaxTree";
import { SyntaxNode } from "../SyntaxTree/SyntaxNode";
import { NodeType } from "../SyntaxTree/NodeTypes";
import { NumberNode } from "../SyntaxTree/NumberNode";
import { VariableNode } from "../SyntaxTree/VariableNode";
import { InvokeNode } from "../SyntaxTree/InvokeNode";
import { OperatorNode } from "../SyntaxTree/OperatorNode";
import { IllegalOperatorError } from "./IllegalOperatorError";
import { UnitNode } from "../SyntaxTree/UnitNode";
import { IllegalNodeError } from "./IllegalNodeError";
import { IllegalUnitOperationError } from "./IllegalUnitOperationError";
import { Dimension } from "./Dimension";
import { ExpressionLexer } from "../ExpressionLexer/ExpressionLexer";
import { Token } from "../ExpressionLexer/Token";
import { readFileSync } from "fs";
import { EACCES } from "constants";

let DerivedUnits : Object = JSON.parse(readFileSync(__dirname + "/DerivedUnits.json", "utf-8"));

export class EvaluationTree {
	private root: SyntaxNode;
	public unitRoot: SyntaxNode;
	public usedUnits: Array<string>;

	constructor(tree: SyntaxTree) {
		this.root = tree.root;
		this.usedUnits = [];
		this.unitRoot = this.buildUnitTree();
	}

	private buildUnitTree(): SyntaxNode {
		return this.buildUnitTreeHelper(this.root);
	}

	private buildUnitTreeHelper(node: SyntaxNode ) : SyntaxNode {
		if (node.type == NodeType.Number) {
			if (node.right == null) {
				return node.right;
			} else {
				let unitNode = <UnitNode>node.right;
				return this.convertToSIUnits(unitNode);
			}
		} else if (node.type == NodeType.Operator) {
			let operatorNode : OperatorNode = <OperatorNode>node;
			let leftUnit: SyntaxNode = this.buildUnitTreeHelper(node.left);
			let rightUnit: SyntaxNode = this.buildUnitTreeHelper(node.right);
			let unitOperator: OperatorNode;
			switch(operatorNode.operator) {
				case '+':
					unitOperator = OperatorNode.createNode('+');
					unitOperator.left = leftUnit;
					unitOperator.right = rightUnit;
					return unitOperator;
				case '-':
					unitOperator = OperatorNode.createNode('-');
					unitOperator.left = leftUnit;
					unitOperator.right = rightUnit;
					return unitOperator;
				case '*':
					unitOperator = OperatorNode.createNode('*');
					unitOperator.left = leftUnit;
					unitOperator.right = rightUnit;
					return unitOperator;
				case '/':
					unitOperator = OperatorNode.createNode('/');
					unitOperator.left = leftUnit;
					unitOperator.right = rightUnit;
					return unitOperator;
				case '^':
					unitOperator = OperatorNode.createNode('^');
					unitOperator.left = leftUnit;
					unitOperator.right = rightUnit;
					return unitOperator;
				default:
					throw new IllegalOperatorError("Illegal Operator " + operatorNode.operator);
			}
		}
	}

	private convertToSIUnits(node: UnitNode): SyntaxNode {
		if (node.unit !== undefined) {
			this.usedUnits.push(node.unit);
		}
		if (DerivedUnits.hasOwnProperty(node.unit)) {
			let lexer : ExpressionLexer = new ExpressionLexer(DerivedUnits[node.unit]);
			let tokens : Array<Token> = lexer.lex();
			let tree : SyntaxTree = new SyntaxTree(tokens);
			tree.build();
			let evaluationTree = new EvaluationTree(tree);
			return evaluationTree.unitRoot;
		} else {
			return node;
		}
	}

	public evaluateValue(variable: number): number {
		return this.evaluateValueHelper(this.root, variable);
	}

	private evaluateValueHelper(node: SyntaxNode, variable: number): number {
		if (node == null) {
			return 0;
		} else if (node.type == NodeType.Number) {
			let numberNode = <NumberNode>node;
			return numberNode.number;
		} else if (node.type == NodeType.Variable) {
			let variableNode = <VariableNode>node;
			// should check the workspace for constant
			return variable;
		} else if (node.type == NodeType.Invoke) {
			let invokeNode : InvokeNode = <InvokeNode>node;
			let functionName : string = (<VariableNode>invokeNode.left).variable;
			let functionEvaluationTree = null // get tree from workspace
			let functionParameter = this.evaluateValueHelper(invokeNode.right, variable);
			// return this.evaluateValueHelper(functionEvaluationTree.root, functionParameter);
			return 0;
		} else if (node.type == NodeType.Absolute) {
			return Math.abs(this.evaluateValueHelper(node.right, variable));
		} else if (node.type == NodeType.Operator) {
			let operatorNode : OperatorNode = <OperatorNode>node;
			let a : number = this.evaluateValueHelper(operatorNode.left, variable);
			let b : number = this.evaluateValueHelper(operatorNode.right, variable);
			switch(operatorNode.operator) {
				case '+':
					return a + b;
				case '-':
					return a - b;
				case '*':
					return a * b;
				case '/':
					return a / b;
				case '^':
					return Math.pow(a, b);
				default:
					throw new IllegalOperatorError("Illegal Operator " + operatorNode.operator);
			}
		}
	}

	public evaluateUnits(): string {
		let dimensions = this.evaluateUnitsHelper(this.unitRoot);
		this.removeCanceledUnits(dimensions);
		this.simplifyUnits(dimensions);
		this.removeCanceledUnits(dimensions);
		let unit : string = this.getDimensionsString(dimensions);
		return unit;
	}

	private evaluateUnitsHelper(node : SyntaxNode): Array<Dimension> {
		if (node == null) {
			return [];
		} else if (node.type == NodeType.Unit) {
			let unit = (<UnitNode>node).unit;
			return [new Dimension(unit, 1)];
		} else if (node.type == NodeType.Number) {
			let degree = (<NumberNode>node).number;
			return [new Dimension(null, degree)];
		} else if (node.type == NodeType.Operator) {
			let operatorNode : OperatorNode = <OperatorNode>node;
			let leftDimensions: Array<Dimension> = this.evaluateUnitsHelper(node.left);
			let rightDimensions: Array<Dimension> = this.evaluateUnitsHelper(node.right);
			switch(operatorNode.operator) {
				case '+':
				case '-':
					if (this.isDimensionsEqual(leftDimensions, rightDimensions)) {
						return leftDimensions;
					} else {
						throw new IllegalUnitOperationError(`Illegal Unit Operation of ${operatorNode.operator} between ${this.getDimensionsString(leftDimensions)} and ${this.getDimensionsString(rightDimensions)}`)
					}
				case '/':
					for (let i = 0; i < rightDimensions.length; i++) {
						rightDimensions[i].degree *= -1;
					}
				case '*':
					for (let i = 0; i < rightDimensions.length; i++) {
						let leftIndex = this.indexOfDimension(rightDimensions[i], leftDimensions);
						if (leftIndex == -1) {
							leftDimensions.push(rightDimensions[i]);
						} else {
							leftDimensions[leftIndex].degree += rightDimensions[i].degree;
						}
					}
					return leftDimensions;
				case '^':
					leftDimensions[0].degree = rightDimensions[0].degree;
					return leftDimensions;
				default:
					throw new IllegalOperatorError(`Illegal Operator of Type ${operatorNode.operator}`);
			}
		} else {
			throw new IllegalNodeError(`Node of Type ${node.type} Cannot Exist in The Unit Tree`);
		}
	}

	private isDimensionsEqual(left: Array<Dimension>, right: Array<Dimension>): boolean {
		if (left.length == 0 || right.length == 0) {
			return true;
		}
		if (left.length != right.length) {
			return false;
		}
		for (let i = 0; i < left.length; i++) {
			if (!left[i].equals(right[i])) {
				return false;
			}
		}
		return true;
	}

	private indexOfDimension(dimension: Dimension, dimensions: Array<Dimension>): number {
		for (let i = 0; i < dimensions.length; i++) {
			if (dimension.unit == dimensions[i].unit) {
				return i;
			}
		}
		return -1;
	}

	private removeCanceledUnits(dimensions: Array<Dimension>): void {
		for (let i = dimensions.length - 1; i >= 0; i--) {
			if (dimensions[i].degree == 0) {
				dimensions.splice(i, 1);
			}
		}
	}

	private simplifyUnits(dimensions: Array<Dimension>): void {
		let possibleSimplifications: { [ unit: string]: Array<Dimension> } = {};
		for (const unit in DerivedUnits) {
			if (unit != "Gy" && unit != "Sv" && unit != "dioptry") {
				const SIUnits: Array<Dimension> = this.createDimensionArray(DerivedUnits[unit]);
				if (this.canSimplify(dimensions, SIUnits)) {
					possibleSimplifications[unit] = SIUnits;
				}
			}
		}
		let bestSimplificationUnit = this.getBestSimplification(
			possibleSimplifications,
			dimensions
		);
		console.log(bestSimplificationUnit);
	}

	private canSimplify(dimensions: Array<Dimension>, SIUnits: Array<Dimension>): boolean {
		for (let i = 0; i < SIUnits.length; i++) {
			let indexOfDimension = this.indexOfDimension(SIUnits[i], dimensions);
			if (indexOfDimension == -1) {
				return false;
			}
		}
		return true;
	}

	private getBestSimplification(
		possibleSimplifications: { [ unit: string]: Array<Dimension> }, 
		dimensions: Array<Dimension>
	): string {
		let longestSimplificationUnits : Array<string> = this.getLongestCommonSimplificationUnit(possibleSimplifications);
		if (longestSimplificationUnits.length == 1) {
			return longestSimplificationUnits[0];
		}
		possibleSimplifications = this.getNewPossibleSimplifications(
			longestSimplificationUnits, 
			possibleSimplifications
		);
		let differences = this.getDegreeDifferences(possibleSimplifications, dimensions);
		return ""; 
	}

	private getLongestCommonSimplificationUnit(
		possibleSimplifications: { [ unit: string]: Array<Dimension> }
	): Array<string> {
		let longestCommonUnits : Array<string> = [];
		let max = -1;
		for (const unit in possibleSimplifications) {
			if (max < possibleSimplifications[unit].length) {
				max = possibleSimplifications[unit].length;
				longestCommonUnits = [unit];
			} else if (max == possibleSimplifications[unit].length) {
				longestCommonUnits.push(unit);
			}
		}
		return longestCommonUnits;
	}

	private getNewPossibleSimplifications(
		units: Array<string>, 
		simplifications: { [ unit: string]: Array<Dimension> }
	): { [ unit: string]: Array<Dimension> } {
		let newSimplifications : { [ unit: string]: Array<Dimension> } = {};
		for (const unit in simplifications) {
			let i = units.indexOf(unit);
			if (i != -1) {
				newSimplifications[unit] = simplifications[unit];
			}
		}
		return newSimplifications;
	}

	private getDegreeDifferences(
		possibleDimensions: Array<Array<Dimension>>, 
		dimensions: Array<Dimension>
	): Array<number> {
		let differenceSums : Array<number> = [];
		for (let i = 0; i < possibleDimensions.length; i++) {
			let sum: number = 0;
			for (let j = 0; j < possibleDimensions[i].length; j++) {
				let dimensionIndex: number = this.indexOfDimension(possibleDimensions[i][j], dimensions);
				let diff: number = Math.abs(possibleDimensions[i][j].degree - dimensions[dimensionIndex].degree);
				sum += diff;
			}
			differenceSums.push(sum);
		}
		return differenceSums;
	}

	private getSmallestDifferenceIndex(): number {

	}

	private createDimensionArray(dimensionString: string): Array<Dimension> {
		let units = dimensionString.split('*');
		let dimensions = [];
		for (let i = 0; i < units.length; i++) {
			let parts = units[i].split('^');
			let unit = parts[0].replace(/\s/g, '').substring(1, parts[0].length);
			let degree = parseInt(parts[1]);
			if (isNaN(degree)) {
				degree = 1;
			}
			dimensions.push(new Dimension(unit, degree));
		}
		return dimensions;
	}

	private getDimensionsString(dimensions: Array<Dimension>): string {
		let dimensionString = "";
		for (let i = 0; i < dimensions.length; i++) {
			dimensionString += dimensions[i].toString();
			if (i != dimensions.length - 1) {
				dimensionString += "*";
			}
		}
		return dimensionString
	}
}