import { expect } from "chai";
import { SyntaxTree } from "../../src/SyntaxTree/SyntaxTree";
import { NodeType } from "../../src/SyntaxTree/NodeTypes";
import { SyntaxNode } from "../../src/SyntaxTree/SyntaxNode";
import { NumberNode } from "../../src/SyntaxTree/NumberNode";
import { UnitNode } from "../../src/SyntaxTree/UnitNode";
import { OperatorNode } from "../../src/SyntaxTree/OperatorNode";

export function checkTreeStructure(tree : SyntaxTree, expectedStructure: Array<NodeType>): void {
	checkTreeStructureHelper(tree.root, expectedStructure, 0);
}

function checkTreeStructureHelper(node : SyntaxNode, expectedStructure: Array<NodeType>, i) {
	if (node == null) {
		return i - 1;
	} else {
		expect(node.type).to.equal(expectedStructure[i]);
		i = checkTreeStructureHelper(node.left, expectedStructure, i + 1);
		i = checkTreeStructureHelper(node.right, expectedStructure, i + 1);
		return i;
	}
}

export function checkTreeSize(tree: SyntaxTree, expectedSize):void {
	let size : number = getTreeSize(tree.root);
	expect(size).to.equal(expectedSize);
}

function getTreeSize(node : SyntaxNode): number {
	if (node == null) {
		return 0;
	} else {
		return getTreeSize(node.left) + getTreeSize(node.right) + 1;
	}
}

export function checkTreeValue(tree: SyntaxTree, expectedValues: Array<any>): void {
	checkTreeValueHelper(tree.root, expectedValues, 0);
}

function checkTreeValueHelper(node: SyntaxNode, expectedValues: Array<any>, i) {
	if (node == null) {
		return i - 1;
	} else {
		switch (node.type) {
			case NodeType.Number:
				let numberNode = <NumberNode>node;
				expect(numberNode.number).to.equal(expectedValues[i]);
				break;
			case NodeType.Unit:
				let unitNode = <UnitNode>node;
				expect(unitNode.unit).to.equal(expectedValues[i]);
				break;
			case NodeType.Operator:
				let operatorNode = <OperatorNode>node;
				expect(operatorNode.operator).to.equal(expectedValues[i]);
				break;
			default:
				break;
		}
		i = checkTreeValueHelper(node.left, expectedValues, i + 1);
		i = checkTreeValueHelper(node.right, expectedValues, i + 1);
		return i;
	}
}