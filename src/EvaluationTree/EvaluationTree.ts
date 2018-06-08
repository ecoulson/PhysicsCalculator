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

export class EvaluationTree {
	private root: SyntaxNode;

	constructor(tree: SyntaxTree) {
		this.root = tree.root;
	}

	public evaluateValue(variable: number): number {
		let unitStruct : UnitStruct = new UnitStruct();
		return this.evaluateValueHelper(this.root, variable, unitStruct);
	}

	private evaluateValueHelper(node: SyntaxNode, variable: number, unitStruct: UnitStruct): number {
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
			let functionParameter = this.evaluateValueHelper(invokeNode.right, variable, unitStruct);
			// return this.evaluateValueHelper(functionEvaluationTree.root, functionParameter);
			return 0;
		} else if (node.type == NodeType.Absolute) {
			return Math.abs(this.evaluateValueHelper(node.right, variable, unitStruct));
		} else if (node.type == NodeType.Operator) {
			let operatorNode : OperatorNode = <OperatorNode>node;
			let a : number = this.evaluateValueHelper(operatorNode.left, variable, unitStruct);
			let b : number = this.evaluateValueHelper(operatorNode.right, variable, unitStruct);
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

	public evaluateUnits(node: SyntaxNode, unitStruct: UnitStruct): void {
		if (node.type == NodeType.Operator) {
			let operatorNode = <OperatorNode>node;
			switch (operatorNode.operator) {
				case "+":
					let aNode = <UnitNode>operatorNode.left;
					let bNode = <UnitNode>
					if (operatorNode.left)
					break;
				case "-":

					break;
				case "*":

					break;
				case "/":

					break;
				case "^":

					break;
				default:
					throw new IllegalOperatorError("Illegal Operator " + operatorNode.operator);
			}
		} else if (node.type == NodeType.Unit) {
			let unitNode = <UnitNode>node;
			unitStruct.nominator.push(unitNode);
		}
	}
}