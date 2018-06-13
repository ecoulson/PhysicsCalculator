import { expect } from "chai";
import { WorkSpace } from "../src/WorkSpace/WorkSpace";
import { readInputFile } from "./Helpers/InputHelper";

const workspace : WorkSpace = new WorkSpace();
const inputs: Array<any> = readInputFile("ExpressionParserInputs");

describe("Workspace Test Suite", () => {
	it("Should not have a formula \"F\"", () => {
		let hasFormula = workspace.hasFormula("F");
		expect(hasFormula).to.equal(false);
	});

	it("Should define formula", () => {
		workspace.defineFormula("F=2N");
	});

	it("Should have a formula \"F\"", () => {
		let hasFormula = workspace.hasFormula("F");
		expect(hasFormula).to.equal(true);
	});

	it("Should evaluate \"F\" to be 2N", () => {
		let result = workspace.evaluate("F");
		expect(result).to.equal("2N");
	});
})