import { expect } from "chai";
import { SyntaxTree } from "../../src/SyntaxTree/SyntaxTree";
import { NodeType } from "../../src/SyntaxTree/NodeTypes";
import { SyntaxNode } from "../../src/SyntaxTree/SyntaxNode";

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