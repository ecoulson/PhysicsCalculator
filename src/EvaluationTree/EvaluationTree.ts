import { SyntaxTree } from "../SyntaxTree/SyntaxTree";
import { SyntaxNode } from "../SyntaxTree/SyntaxNode";
import { NodeType } from "../SyntaxTree/NodeTypes";
import { NumberNode } from "../SyntaxTree/NumberNode";
import { VariableNode } from "../SyntaxTree/VariableNode";
import { InvokeNode } from "../SyntaxTree/InvokeNode";
import { OperatorNode } from "../SyntaxTree/OperatorNode";
import { IllegalOperatorError } from "./IllegalOperatorError";
import { UnitStruct } from "./UnitStruct";
import { UnitNode } from "../SyntaxTree/UnitNode";
import { IllegalUnitOperationError } from "./IllegalUnitOperationError";
import { IllegalNodeError } from "./IllegalNodeError";
import { Unit } from "./Unit";

export class EvaluationTree {
	private root: SyntaxNode;
	public unitRoot: SyntaxNode;

	constructor(tree: SyntaxTree) {
		this.root = tree.root;
		this.unitRoot = this.buildUnitTree();
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

	private buildUnitTree(): SyntaxNode {
		return this.buildUnitTreeHelper(this.root);
	}

	private buildUnitTreeHelper(node: SyntaxNode ) : SyntaxNode {
		if (node.type == NodeType.Number) {
			return node.right;
		} else if (node.type == NodeType.Unit) {
			return node;
		} else if (node.type == NodeType.Operator) {
			let operatorNode : OperatorNode = <OperatorNode>node;
			let leftUnit: SyntaxNode = this.buildUnitTreeHelper(node.left);
			let rightUit: SyntaxNode = this.buildUnitTreeHelper(node.right);
			let unitOperator: OperatorNode;
			switch(operatorNode.operator) {
				case '+':
					unitOperator = OperatorNode.createNode('+');
					unitOperator.left = leftUnit;
					unitOperator.right = rightUit;
					return unitOperator;
				case '-':
					unitOperator = OperatorNode.createNode('-');
					unitOperator.left = leftUnit;
					unitOperator.right = rightUit;
					return unitOperator;
				case '*':
					unitOperator = OperatorNode.createNode('*');
					unitOperator.left = leftUnit;
					unitOperator.right = rightUit;
					return unitOperator;
				case '/':
					unitOperator = OperatorNode.createNode('/');
					unitOperator.left = leftUnit;
					unitOperator.right = rightUit;
					return unitOperator;
				case '^':
					unitOperator = OperatorNode.createNode('^');
					unitOperator.left = leftUnit;
					unitOperator.right = rightUit;
					return unitOperator;
				default:
					throw new IllegalOperatorError("Illegal Operator " + operatorNode.operator);
			}
		}
	}

	public evaluateUnits(): UnitStruct {
		let unitStruct = new UnitStruct();
		this.evaluateUnitsHelper(this.unitRoot, unitStruct);
		return unitStruct;
	}

	private evaluateUnitsHelper(node : SyntaxNode, unitStruct: UnitStruct) {
		if (node.type == NodeType.Unit) {
			return node;
		} else if (node.type == NodeType.Number) {
			return node;
		} else if (node) {
			let operatorNode : OperatorNode = <OperatorNode>node;
			let leftUnit: SyntaxNode = this.evaluateUnitsHelper(node.left, unitStruct);
			let rightUnit: SyntaxNode = this.evaluateUnitsHelper(node.right, unitStruct);
			let unitOperator: OperatorNode;
			switch(operatorNode.operator) {
				case '+':
					break;
				case '-':
					break;
				case '*':
					let multiplyLeftUnitNode = <UnitNode>leftUnit;
					let multiplyRightUnitNode = <UnitNode>rightUnit;
					// console.log(unitStruct.currentLevel);
					unitStruct.currentLevel.push(new Unit(multiplyLeftUnitNode.unit, 1));
					unitStruct.currentLevel.push(new Unit(multiplyRightUnitNode.unit, 1));
					return multiplyRightUnitNode;
				case '/':
					let divideLeftUnit = <UnitNode>leftUnit;
					let divideRightUnit = <UnitNode>rightUnit;
					// console.log(unitStruct.currentLevel);
					unitStruct.currentLevel.push(new Unit(divideLeftUnit.unit, 1));
					unitStruct.addLevel();
					unitStruct.currentLevel.push(new Unit(divideRightUnit.unit, 1));
					// return divideRightUnit;
					break;
				case '^':
					let expUnitNode = <UnitNode>leftUnit;
					let degreeNode = <NumberNode>rightUnit;
					console.log(unitStruct.currentLevel);
					let expUnit = new Unit(expUnitNode.unit, degreeNode.number);
					unitStruct.currentLevel.push(expUnit);
					return UnitNode.createNode(`${expUnit.unit}^${expUnit.degree}`);
				default:
					throw new IllegalOperatorError("Illegal Operator " + operatorNode.operator);
			}
		} else {
			throw new IllegalNodeError(`Node of Type ${node.type} Cannot Exist in The Unit Tree`);
		}
	}
}