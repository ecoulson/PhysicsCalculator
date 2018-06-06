import { expect } from "chai";
import { SyntaxTree } from "../../src/SyntaxTree/SyntaxTree";
import { NodeType } from "../../src/SyntaxTree/NodeTypes";
import { SyntaxNode } from "../../src/SyntaxTree/SyntaxNode";
import { NumberNode } from "../../src/SyntaxTree/NumberNode";
import { UnitNode } from "../../src/SyntaxTree/UnitNode";

export function checkTreeStructure(tree : SyntaxTree, expectedStructure: Array<NodeType>): void {
	checkTreeStructureHelper(tree.root, expectedStructure, 0);
}

function checkTreeStructureHelper(node : SyntaxNode, expectedStructure: Array<NodeType>, i): void {
	if (node != null) {
		expect(node.type).to.equal(expectedStructure[i]);
		checkTreeStructureHelper(node.left, expectedStructure, i++);
		checkTreeStructureHelper(node.right, expectedStructure, i++);
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
	if (node != null) {
		switch (node.type) {
			case NodeType.Number:
				let numberNode = <NumberNode>node;
				expect(numberNode.number).to.equal(expectedValues[i]);
				break;
			case NodeType.Unit:
				let unitNode = <UnitNode>node;
				expect(unitNode.unit).to.equal(expectedValues[i]);
				break;
			default:
				break;
		}
		checkTreeValueHelper(node.left, expectedValues, i++);
		checkTreeValueHelper(node.right, expectedValues, i++);
	}
}