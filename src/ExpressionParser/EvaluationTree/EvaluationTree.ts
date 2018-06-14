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
import { readFileSync } from "fs";
import { resolve } from "path";
import { ExpressionParser } from "../ExpressionParser";
import { WorkSpace } from "../../WorkSpace/WorkSpace";
import { UndefinedVariableError } from "./UndefinedVariableError";
import { UndefinedFunctionError } from "./UndefinedFunctionError";

const UnitInfoDir = resolve(__dirname, "../UnitInfo");
const DERIVED_UNITS : Object = JSON.parse(readFileSync(resolve(UnitInfoDir, "DerivedUnits.json"), "utf-8"));
const PREFIXES : Object = JSON.parse(readFileSync(resolve(UnitInfoDir, "Prefixes.json"), "utf-8"));
const UNITS : Array<string> = JSON.parse(readFileSync(resolve(UnitInfoDir, "Units.json"), "utf-8"));
const DIMENSIONLESS_UNITS : Array<string> = JSON.parse(readFileSync(resolve(UnitInfoDir, "DimensionlessUnits.json"), "utf-8"));

export class EvaluationTree {
	public root: SyntaxNode;
	private base10Exp: number;
	public unitRoot: SyntaxNode;
	private workspace : WorkSpace;

	constructor(tree: SyntaxTree, workspace: WorkSpace) {
		this.workspace = workspace;
		this.root = tree.root;
		this.unitRoot = this.buildUnitTree();
		this.base10Exp = this.getBase10Exponent(this.unitRoot);
	}

	private buildUnitTree(): SyntaxNode {
		return this.buildUnitTreeHelper(this.root);
	}

	private buildUnitTreeHelper(node: SyntaxNode ) : SyntaxNode {
		if (node.type == NodeType.Number) {
			if (node.right == null) {
				return null;
			} else {
				return this.convertToSIUnits(node.right);
			}
		} else if (node.type == NodeType.Variable) {
			let variableNode : VariableNode = <VariableNode>node;
			if (this.workspace.hasFormula(variableNode.variable)) {
				return this.workspace.getFormulaResultUnit(variableNode.variable);
			} else {
				throw new UndefinedVariableError(`Undefined Variable ${variableNode.variable} in workspace`);
			}
		} else if (node.type == NodeType.Invoke) {
			let variableNode: VariableNode = <VariableNode>node.left;
			if (variableNode.variable == "sqrt") {
				let nonSqrtedUnit : SyntaxNode = this.buildUnitTreeHelper(node.right);
				let raised =  this.raiseLeftUnitBy(nonSqrtedUnit, 0.5);
				return raised;
			} else {
				return this.buildUnitTreeHelper(node.right);
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
					if (this.shouldRaiseSubtree(node)) {
						let numberNode = <NumberNode>node.right;
						leftUnit = this.raiseLeftUnitBy(leftUnit, numberNode.number)
						return leftUnit;
					} else {
						unitOperator = OperatorNode.createNode('^');
						unitOperator.left = leftUnit;
						unitOperator.right = rightUnit;
						return unitOperator;
					}
				default:
					throw new IllegalOperatorError("Illegal Operator " + operatorNode.operator);
			}
		}
	}

	private convertToSIUnits(node: SyntaxNode): SyntaxNode {
		if (node == null) {
			return null;
		} else if (node.type == NodeType.Unit) {
			let unitNode = <UnitNode>node;
			if (DERIVED_UNITS.hasOwnProperty(unitNode.unit)) {
				//TODO: move all derived units expressionparsers into the workspace class
				let unitParser : ExpressionParser = new ExpressionParser(DERIVED_UNITS[unitNode.unit], this.workspace);
				unitParser.evaluate();
				return unitParser.evaluationTree.unitRoot;
			} else {
				return node;
			}
		} else if (node.type == NodeType.Operator) {
			node.left = this.convertToSIUnits(node.left);
			node.right = this.convertToSIUnits(node.right);
			return node;
		} else {
			return node;
		}
	}

	private shouldRaiseSubtree(node: SyntaxNode) {
		return (node.left.type == NodeType.Variable || node.left.type == NodeType.Operator) && node.right.type == NodeType.Number;
	}

	private raiseLeftUnitBy(node: SyntaxNode, degree: number): SyntaxNode {
		if (node == null) {
			return node;
		} else if (node.type == NodeType.Number) {
			let numberNode = <NumberNode>node;
			numberNode.number *= degree;
			let newNumber : NumberNode = NumberNode.createNode(numberNode.number);
			return newNumber;
		} else if (node.type == NodeType.Unit) {
			let unitNode = <UnitNode>node;
			let newUnit = UnitNode.createNode(unitNode.unit);
			unitNode.degree = unitNode.degree;
			newUnit.degree *= degree;
			return newUnit;
		} else if (node.type == NodeType.Operator) {
			let operatorNode = <OperatorNode>node;
			let newOperator = OperatorNode.createNode(operatorNode.operator);
			newOperator.left = this.raiseLeftUnitBy(node.left, degree);
			newOperator.right = this.raiseLeftUnitBy(node.right, degree);
			return newOperator;
		} else {
			return node;
		}
	}

	private getBase10Exponent(node: SyntaxNode): number {
		if (node == null) {
			return 0;
		} else if (node.type == NodeType.Number) {
			return (<NumberNode>node).number;
		} else if (node.type == NodeType.Unit) {
			let unitNode : UnitNode = <UnitNode>node;
			let exp = this.getBase10Conversion(unitNode);
			this.convertToBaseUnit(unitNode);
			return exp;
		} else {
			let operatorNode: OperatorNode = <OperatorNode>node;
			let leftExponent = this.getBase10Exponent(node.left);
			let rightExponent = this.getBase10Exponent(node.right);
			switch (operatorNode.operator) {
				case '+':
				case '-':
					if (leftExponent == rightExponent) {
						return leftExponent;
					} else {
						throw new IllegalUnitOperationError(`Illegal Unit Operation ${operatorNode.operator} between ${leftExponent} and ${rightExponent}`);
					}
				case '*':
					return leftExponent + rightExponent;
				case '/':
					return leftExponent - rightExponent;
				case '^':
					return leftExponent * rightExponent;
				default:
					throw new IllegalOperatorError(`Illegal Operator of Type ${operatorNode.operator}`);
			}
		}
	}
	
	private getBase10Conversion(node: UnitNode): number {
		let unit = node.unit;
		if (unit == "cycles" || unit == "decays") {
			return 0;
		}
		if (UNITS.indexOf(unit) != -1) {
			return 0;
		} else {
			let prefix = unit[0];
			let base = unit.substring(1, unit.length);
			if (prefix == "\\") {
				prefix = unit.substring(0, 3);
				base = unit.substring(3, unit.length);
			}
			if (PREFIXES.hasOwnProperty(prefix) && UNITS.indexOf(base) != -1 || base == "g") {
				if (base == "g") {
					return PREFIXES[prefix] - 3;
				}
				return PREFIXES[prefix];
			} else {
				if (unit == "g") {
					return -3;
				}
				return 0;
			}
		}
	}

	private convertToBaseUnit(node: UnitNode): void {
		let base : string = this.getBaseUnit(node.unit);
		node.unit = base;
	}

	private getBaseUnit(unit: string): string {
		if (unit == "decays" || unit == "cycles") {
			return unit;
		}
		if (UNITS.indexOf(unit) != -1) {
			return unit;
		} else {
			let prefix = unit[0];
			let base = unit.substring(1, unit.length);
			if (prefix == "\\") {
				prefix = unit.substring(0, 3);
				base = unit.substring(3, unit.length);
			}
			if (PREFIXES.hasOwnProperty(prefix) && UNITS.indexOf(base) != -1 || base == "g") {
				if (base == "g") {
					return "kg";
				}
				return base;
			} else {
				if (unit == "g") {
					return "kg"
				}
				return unit;
			}
		}
	}

	public evaluate(): string {
		let value : number = this.evaluateValue();
		let unit : string = this.evaluateUnits();
		return `${value}${unit}`;
	}

	public evaluateValue(): number {
		return this.evaluateValueHelper(this.root) * Math.pow(10, this.base10Exp);
	}

	private evaluateValueHelper(node: SyntaxNode): number {
		if (node == null) {
			return 0;
		} else if (node.type == NodeType.Number) {
			let numberNode = <NumberNode>node;
			return numberNode.number;
		} else if (node.type == NodeType.Variable) {
			let variableNode = <VariableNode>node;
			if (this.workspace.hasFormula(variableNode.variable)) {
				let formula : EvaluationTree = this.workspace.getFormula(variableNode.variable);
				return formula.evaluateValue();
			} else {
				throw new UndefinedVariableError(`Undefined Variable ${variableNode.variable} in workspace`);
			}
		} else if (node.type == NodeType.Invoke) {
			let invokeNode : InvokeNode = <InvokeNode>node;
			let functionName : string = (<VariableNode>invokeNode.left).variable;
			let functionParameter : number = this.evaluateValueHelper(invokeNode.right);
			if (this.workspace.hasFunction(functionName)) {
				let func: Function = this.workspace.getFunction(functionName);
				return func(functionParameter);
			} else {
				throw new UndefinedFunctionError(`Undefined Function ${functionName}`);
			}
		} else if (node.type == NodeType.Absolute) {
			return Math.abs(this.evaluateValueHelper(node.right));
		} else if (node.type == NodeType.Operator) {
			let operatorNode : OperatorNode = <OperatorNode>node;
			let a : number = this.evaluateValueHelper(operatorNode.left);
			let b : number = this.evaluateValueHelper(operatorNode.right);
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
		dimensions = this.removeDimensionlessUnits(dimensions);
		let unit : string = this.getDimensionsString(dimensions);
		return unit;
	}

	private evaluateUnitsHelper(node : SyntaxNode): Array<Dimension> {
		if (node == null) {
			return [];
		} else if (node.type == NodeType.Unit) {
			let unitNode = <UnitNode>node;
			return [new Dimension(unitNode.unit, unitNode.degree)];
		} else if (node.type == NodeType.Number) {
			let degree = (<NumberNode>node).number;
			return [new Dimension(null, degree)];
		} else if (node.type == NodeType.Variable) {
			return [];
		} else if (node.type == NodeType.Operator) {
			let operatorNode : OperatorNode = <OperatorNode>node;
			let leftDimensions: Array<Dimension> = this.evaluateUnitsHelper(node.left);
			let rightDimensions: Array<Dimension> = this.evaluateUnitsHelper(node.right);
			switch(operatorNode.operator) {
				case '+':
				case '-':
					let leftDimensionsRemoveDimensionless = this.removeDimensionlessUnits(leftDimensions);
					let rightDimensionsRemoveDimensionless = this.removeDimensionlessUnits(rightDimensions);
					if (this.isDimensionsEqual(leftDimensionsRemoveDimensionless, rightDimensionsRemoveDimensionless)) {
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
		let possibleSimplifications: { [ unit: string]: Array<Dimension> } = this.getPossibleSimplifications(dimensions);
		let bestSimplificationUnit = this.getBestSimplification(
			possibleSimplifications,
			dimensions
		);
		if (bestSimplificationUnit != null) {
			let bestSimplificationDimensions = possibleSimplifications[bestSimplificationUnit];
			this.simplify(dimensions, bestSimplificationDimensions);
			dimensions.unshift(new Dimension(bestSimplificationUnit, 1));
		}
	}

	private getPossibleSimplifications(dimensions: Array<Dimension>): { [ unit: string]: Array<Dimension> } {
		let possibleSimplifications: { [ unit: string]: Array<Dimension> } = {};
		for (const unit in DERIVED_UNITS) {
			if (unit != "Gy" && unit != "Sv" && unit != "dioptry") {
				const SIUnits: Array<Dimension> = this.createDimensionArray(DERIVED_UNITS[unit]);
				if (this.canSimplify(dimensions, SIUnits)) {
					possibleSimplifications[unit] = SIUnits;
				}
			}
		}
		return possibleSimplifications;
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
		if (longestSimplificationUnits.length == 0) {
			return null;
		}
		if (longestSimplificationUnits.length == 1) {
			return longestSimplificationUnits[0];
		}
		possibleSimplifications = this.getNewPossibleSimplifications(
			longestSimplificationUnits, 
			possibleSimplifications
		);
		let differences = this.getDegreeDifferences(possibleSimplifications, dimensions);
		let bestUnit = this.getSmallestDifferenceUnit(differences);
		return bestUnit; 
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
		possibleSimplifications: { [ unit: string]: Array<Dimension> }, 
		dimensions: Array<Dimension>
	): { [unit: string]: number } {
		let unitDifferences : { [unit: string]: number }  = {};
		for (const unit in possibleSimplifications) {
			let sum : number = 0;
			for (let j = 0; j < possibleSimplifications[unit].length; j++) {
				let dimensionIndex: number = this.indexOfDimension(possibleSimplifications[unit][j], dimensions);
				let diff: number = possibleSimplifications[unit][j].degree - dimensions[dimensionIndex].degree;
				sum += Math.abs(diff);
			}
			unitDifferences[unit] = sum;
		}
		return unitDifferences;
	}

	private simplify(dimensions: Array<Dimension>, bestSimplificationDimensions: Array<Dimension>): void {
		for (let i = 0; i < bestSimplificationDimensions.length; i++) {
			let dimensionIndex = this.indexOfDimension(bestSimplificationDimensions[i], dimensions);
			dimensions[dimensionIndex].degree -= bestSimplificationDimensions[i].degree;
		}
	}

	private getSmallestDifferenceUnit(differences: { [unit: string]: number }): string {
		// can be zero because the differences are absolute values;
		let min = -1;
		let minUnit = "";
		for (const unit in differences) {
			if (differences[unit] < min || min == -1) {
				minUnit = unit;
				min = differences[unit];
			}
		}
		return minUnit;
	}

	private removeDimensionlessUnits(dimensions: Array<Dimension>): Array<Dimension> {
		let numerator : Array<Dimension> = [];
		let denominator : Array<Dimension> = [];
		for (let i = 0; i < dimensions.length; i++) {
			if (dimensions[i].degree > 0) {
				numerator.push(dimensions[i]);
			} else {
				denominator.push(dimensions[i]);
			}
		}
		if (numerator.length > 1 && this.hasDimensionlessUnits(numerator)) {
			this.removeDimensionlessUnitsFromNumerator(numerator);
		}
		if (this.hasDimensionlessUnits(denominator)) {
			for (let i = denominator.length - 1; i >= 0; i--) {
				let unit = denominator[i].unit;
				if (DIMENSIONLESS_UNITS.indexOf(unit) != -1 && unit != "min" && unit != "hr") {
					denominator.splice(i, 1);
				}
			}
		}
		return numerator.concat(denominator);
	}

	private hasDimensionlessUnits(dimensions: Array<Dimension>): boolean {
		for (let i = 0; i < dimensions.length; i++) {
			if (DIMENSIONLESS_UNITS.indexOf(dimensions[i].unit) != -1) {
				return true;
			}
		}
		return false;
	}

	private removeDimensionlessUnitsFromNumerator(dimensions: Array<Dimension>): void {
		for (let i = 0; i < dimensions.length; i++) {
			let unit = dimensions[i].unit;
			// min and hr are not removed as they can occur in units such as kWh
			if (DIMENSIONLESS_UNITS.indexOf(unit) != -1 && unit != "min" && unit != "hr") {
				dimensions.splice(i, 1);
				return;
			}
		}
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
		let hasHitNegative = false;
		for (let i = 0; i < dimensions.length; i++) {
			if (hasHitNegative) {
				dimensions[i].degree = -dimensions[i].degree;
			}
			dimensionString += dimensions[i].toString();
			if (i != dimensions.length - 1) {
				if (dimensions[i + 1].degree < 0 && !hasHitNegative) {
					hasHitNegative = true;
					dimensionString += "/";
				} else {
					dimensionString += "*";
				}
			}
		}
		return dimensionString
	}
}