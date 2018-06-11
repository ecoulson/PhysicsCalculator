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

	public evaluateUnits(): string {
		let unitString = this.evaluateUnitsHelper(this.unitRoot);
		return unitString;
	}

	private evaluateUnitsHelper(node : SyntaxNode): string {
		if (node.type == NodeType.Unit) {
			return (<UnitNode>node).unit;
		} else if (node.type == NodeType.Number) {
			return (<NumberNode>node).number.toString();
		} else if (node) {
			let operatorNode : OperatorNode = <OperatorNode>node;
			let leftUnit: string = this.evaluateUnitsHelper(node.left);
			let rightUnit: string = this.evaluateUnitsHelper(node.right);
			switch(operatorNode.operator) {
				case '+':
				case '-':
					if (leftUnit == rightUnit || (leftUnit == "") !== (rightUnit == "")) {
						if (leftUnit != "") {
							return leftUnit;
						} else {
							return rightUnit
						}			
					} else {
						throw new IllegalUnitOperationError(`Illegal Unit Operation of ${operatorNode.operator} between ${leftUnit} and ${rightUnit}`)
					}
				case '*':
				case '/':
				case '^':
					return `${leftUnit}${operatorNode.operator}${rightUnit}`;
				default:
					throw new IllegalOperatorError(`Illegal Operator of Type ${operatorNode.operator}`);
			}
		} else {
			throw new IllegalNodeError(`Node of Type ${node.type} Cannot Exist in The Unit Tree`);
		}
	}
}