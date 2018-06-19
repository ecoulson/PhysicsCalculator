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
import { readFileSync, writeFile, writeFileSync, appendFileSync } from "fs";
import { resolve } from "path";
import { ExpressionParser } from "../ExpressionParser";
import { WorkSpace } from "../../WorkSpace/WorkSpace";
import { UndefinedVariableError } from "./UndefinedVariableError";
import { UndefinedFunctionError } from "./UndefinedFunctionError";

const UnitInfoDir = resolve(__dirname, "../UnitInfo");
const DERIVED_UNITS : Object = JSON.parse(readFileSync(resolve(UnitInfoDir, "DerivedUnits.json"), "utf-8"));
const PREFIXES : Object = JSON.parse(readFileSync(resolve(UnitInfoDir, "Prefixes.json"), "utf-8"));
const UNITS : Array<string> = JSON.parse(readFileSync(resolve(UnitInfoDir, "Units.json"), "utf-8"));
const BASE_UNITS : Array<string> = JSON.parse(readFileSync(resolve(UnitInfoDir, "BaseUnits.json"), "utf-8"));
const DIMENSIONLESS_UNITS : Array<string> = JSON.parse(readFileSync(resolve(UnitInfoDir, "DimensionlessUnits.json"), "utf-8"));

export class EvaluationTree {
	public root: SyntaxNode;
	private base10Exp: number;
	public unitRoot: SyntaxNode;
	private workspace : WorkSpace;

	constructor(tree: SyntaxTree, workspace: WorkSpace) {
		this.base10Exp = 0;
		this.workspace = workspace;
		this.root = tree.root;
		this.unitRoot = this.buildUnitTree();
		this.base10Exp += this.getBase10Exponent(this.unitRoot);
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
		} else if (node.type == NodeType.Absolute) {
			return this.buildUnitTreeHelper(node.right);
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
			if (DERIVED_UNITS.hasOwnProperty(unitNode.base)) {
				//TODO: move all derived units expressionparsers into the workspace class
				let unitParser : ExpressionParser = new ExpressionParser(DERIVED_UNITS[unitNode.base], this.workspace);
				unitParser.evaluate();
				return unitParser.evaluationTree.unitRoot;
			} else {
				let prefix = this.getPrefix(unitNode);
				let base = this.getBaseUnit(unitNode.unit);
				unitNode.base = base;
				if (DERIVED_UNITS.hasOwnProperty(base)) {
					this.base10Exp += PREFIXES[prefix];
					return this.convertToSIUnits(unitNode);
				} else {
					unitNode.prefix = prefix;
					return unitNode;
				}
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
			newUnit.degree = unitNode.degree * degree;
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
		if ((unit == "cycles" || unit == "decays") || UNITS.indexOf(unit) != -1) {
			return 0;
		}
		let base = this.getBaseUnit(unit);
		if (base == "kg") {
			if (node.prefix == "") {
				return -3;
			} else {
				return PREFIXES[node.prefix] - 3;
			}
		}
		if (node.prefix != "") {
			return PREFIXES[node.prefix];
		} else {
			return 0;
		}
	}

	private getPrefix(node: UnitNode): string {
		if (node.unit == "cycles" || node.unit == "decays") {
			return "";
		}
		if (UNITS.indexOf(node.unit) != -1) {
			return "";
		} else {
			let prefix = node.unit[0];
			let base = node.unit.substring(1, node.unit.length);
			if (prefix == "\\") {
				prefix = node.unit.substring(0, 3);
				base = node.unit.substring(3, node.unit.length);
			}
			if (PREFIXES.hasOwnProperty(prefix) && UNITS.indexOf(base) != -1 || base == "g") {
				return prefix;
			} else {
				return "";
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
		dimensions = this.simplifyUnits(dimensions);
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
					if (leftDimensions.length == 0 && rightDimensions.length == 0) {
						return [];
					}
					if (rightDimensions.length == 0 && leftDimensions.length != 0) {
						return leftDimensions;
					}
					for (let i = 0; i < leftDimensions.length; i++) {
						leftDimensions[i].degree = rightDimensions[0].degree;
					}
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
			for (let i = 0; i < left.length; i++) {
				let dimensionRightIndex = this.indexOfDimension(left[i], right);
				if (dimensionRightIndex == -1 && left[i].degree == 0) {
					return true;
				}
				if (dimensionRightIndex == -1) {
					return false;
				}
				if (!left[i].equals(right[dimensionRightIndex])) {
					return false;
				}
			}
		}
		for (let i = 0; i < left.length; i++) {
			let dimensionRightIndex = this.indexOfDimension(left[i], right);
			if (!left[i].equals(right[dimensionRightIndex])) {
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

	private simplifyUnits(
		dimensions: Array<Dimension>
	): Array<Dimension> {
		let unitCombinations : Array<Array<Dimension>> = this.getAllSimplifications(dimensions);
		if (unitCombinations.length == 0) {
			return dimensions;
		} else if (unitCombinations.length == 1) {
			return unitCombinations[0];
		} else {
			let smallestCombinations = this.getShortestCombinations(unitCombinations);
			if (smallestCombinations.length == 1) {
				return smallestCombinations[0];
			} else {
				return this.getCombinationWithLeastBaseUnits(smallestCombinations);
			}
		}
	}

	private getCombinationWithLeastBaseUnits(combinations: Array<Array<Dimension>>): Array<Dimension> {
		let bestCombination: Array<Dimension> = [];
		let minBaseUnits = Infinity;
		let count = 0;
		for (let i = 0; i < combinations.length; i++) {
			for (let j = 0; j < combinations[i].length; j++) {
				if (BASE_UNITS.indexOf(combinations[i][j].unit) != -1) {
					count++;
				}
			}
			minBaseUnits = Math.min(minBaseUnits, count);
			if (count == minBaseUnits) {
				bestCombination = combinations[i];
			}
		}
		return bestCombination;
	}

	private getAllSimplifications(baseDimensions: Array<Dimension>): Array<Array<Dimension>> {
		let unitCombinations: Array<Array<Dimension>> = [];
		this.getAllSimplificationsHelper(baseDimensions, [], unitCombinations);
		unitCombinations = this.combineLikeTerms(unitCombinations);
		unitCombinations = this.removeEquivalentCombinations(unitCombinations);
		return unitCombinations;
	}

	private combineLikeTerms(combinations: Array<Array<Dimension>>): Array<Array<Dimension>> {
		let newCombinations: Array<Array<Dimension>> = [];
		for (let i = 0; i < combinations.length; i++) {
			newCombinations.push([]);
			for (let j = 0; j < combinations[i].length; j++) {
				let index = this.indexOfDimension(combinations[i][j], newCombinations[i]);
				if (index == -1) {
					newCombinations[i].push(combinations[i][j]);
				} else {
					newCombinations[i][index].degree += combinations[i][j].degree;
				}
			}
		}
		return newCombinations;
	}

	private removeEquivalentCombinations(combinations: Array<Array<Dimension>>): Array<Array<Dimension>> {
		let newCombinations: Array<Array<Dimension>> = [];
		for (let i = 0; i < combinations.length; i++) {
			if (!this.hasCombination(combinations[i], newCombinations)) {
				newCombinations.push(combinations[i]);
			}
		}
		return newCombinations;
	}

	private hasCombination(combination: Array<Dimension>, combinations: Array<Array<Dimension>>): boolean {
		for (let i = 0; i < combinations.length; i++) {
			if (this.isCombinationEqual(combination, combinations[i])) {
				return true;
			}
		}
		return false;
	}

	private isCombinationEqual(combination: Array<Dimension>, other: Array<Dimension>): boolean {
		if (combination.length != other.length) {
			return false;
		} else {
			for (let i = 0; i < combination.length; i++) {
				let j = this.indexOfDimension(combination[i], other);
				if (j == -1) {
					return false;
				} else {
					if (!combination[i].equals(other[j])) {
						return false;
					}
				}
			}
		}
		return true;
	}

	private getAllSimplificationsHelper(
		baseDimensions: Array<Dimension>,
		combination : Array<Dimension>,
		allCombinations: Array<Array<Dimension>>
	): void {
		let simplifications: { [ unit: string]: Array<Dimension> } = this.getSimplifications(baseDimensions);
		if (Object.keys(simplifications).length == 0) {
			allCombinations.push(this.getFullCombination(combination, baseDimensions));
		} else {
			for (const unit in simplifications) {
				let dimensions = this.copyBaseDimensions(baseDimensions);
				let unitDimension = new Dimension(unit, 1);
				if (this.isOppositeSigns(dimensions, simplifications[unit])) {
					unitDimension = new Dimension(unit, -1);
					for (let i = 0; i < simplifications[unit].length; i++) {
						simplifications[unit][i].degree = -simplifications[unit][i].degree;
					}
				}
				this.simplify(dimensions, simplifications[unit]);
				this.removeCanceledUnits(dimensions);
				combination.push(unitDimension);
				this.getAllSimplificationsHelper(dimensions, combination, allCombinations);
				combination.pop();
			}
		}
	}

	private getSimplifications(dimensions: Array<Dimension>): { [ unit: string]: Array<Dimension> } {
		let possibleSimplifications: { [ unit: string]: Array<Dimension> } = {};
		for (const unit in DERIVED_UNITS) {
			if (unit != "Gy" && unit != "Sv" && unit != "dioptry" && unit != "\\deg_C") {
				const SIUnits: Array<Dimension> = this.createDimensionArray(DERIVED_UNITS[unit]);
				if (this.canSimplify(dimensions, SIUnits)) {
					possibleSimplifications[unit] = SIUnits;
				}
			}
		}
		return possibleSimplifications;
	}

	private canSimplify(dimensions: Array<Dimension>, SIUnits: Array<Dimension>): boolean {
		let x = true;
		for (let i = 0; i < SIUnits.length; i++) {
			let indexOfDimension = this.indexOfDimension(SIUnits[i], dimensions);
			if (indexOfDimension == -1) {
				return false;
			}
			if (Math.abs(dimensions[i].degree - SIUnits[i].degree) > Math.abs(dimensions[i].degree)) {
				return false;
			}
		}
		return true;
	}

	private getFullCombination(combination: Array<Dimension>, dimensions: Array<Dimension>): Array<Dimension> {
		let dereferencedCombinations = [];
		for (let i = 0; i < combination.length; i++) {
			dereferencedCombinations.push(combination[i]);
		}
		for (let i = 0; i < dimensions.length; i++) {
			dereferencedCombinations.push(dimensions[i]);
		}
		return dereferencedCombinations;
	}

	private copyBaseDimensions(baseDimensions: Array<Dimension>) {
		let dimensions : Array<Dimension> = [];
		for (let i = 0; i < baseDimensions.length; i++) {
			dimensions[i] = new Dimension(baseDimensions[i].unit, baseDimensions[i].degree);
		}
		return dimensions;
	}

	private isOppositeSigns(dimensions: Array<Dimension>, simplificationDimensions: Array<Dimension>) {
		for (let i = 0; i < simplificationDimensions.length; i++) {
			let dimensionIndex = this.indexOfDimension(simplificationDimensions[i], dimensions);	
			if ((dimensions[dimensionIndex].degree ^ simplificationDimensions[i].degree) >= 0) {
				return false;
			}
		}
		return true;
	}

	private simplify(dimensions: Array<Dimension>, simplificationDimensions: Array<Dimension>): void {
		for (let i = 0; i < simplificationDimensions.length; i++) {
			let dimensionIndex = this.indexOfDimension(simplificationDimensions[i], dimensions);
			dimensions[dimensionIndex].degree -= simplificationDimensions[i].degree;
		}
	}

	private getShortestCombinations(combinations: Array<Array<Dimension>>): Array<Array<Dimension>> {
		let shortestCombinations: Array<Array<Dimension>> = [];
		let minSize = this.getSmallestArraySize(combinations);
		for (let i = 0; i < combinations.length; i++) {
			if (combinations[i].length == minSize) {
				shortestCombinations.push(combinations[i]);
			}
		}
		return shortestCombinations;
	}

	private getSmallestArraySize(array: Array<Array<any>>): number {
		let minSize = Infinity;
		for (let i = 0; i < array.length; i++) {
			minSize = Math.min(array[i].length, minSize);
		}
		return minSize;
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
				if (DIMENSIONLESS_UNITS.indexOf(unit) != -1 && unit != "min" && unit != "hr" && unit != "hp") {
					denominator.splice(i, 1);
				}
			}
		}
		this.sortUnitsByMagnitude(numerator);
		this.sortUnitsByMagnitude(denominator);
		return numerator.concat(denominator);
	}

	private sortUnitsByMagnitude(dimensions: Array<Dimension>) {
		dimensions.sort((a, b) => {
			if (a.degree < b.degree) {
				return -1;
			} else if (a.degree == b.degree) {
				return 0;
			} else {
				return 1;
			}
		})
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
			if (DIMENSIONLESS_UNITS.indexOf(unit) != -1 && unit != "min" && unit != "hr" && unit != "hp") {
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