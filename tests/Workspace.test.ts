import { expect } from "chai";
import { WorkSpace } from "../src/WorkSpace/WorkSpace";
import { readInputFile } from "./Helpers/InputHelper";

const workspace : WorkSpace = new WorkSpace();
const inputs: Array<any> = readInputFile("WorkSpaceInputs");

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

	it("Should clear the workspace", () => {
		workspace.clear();
		let hasFormula = workspace.hasFormula("F");
		expect(hasFormula).to.equal(false);
	});

	for (let i = 0; i < inputs.length; i++) {
		let definedFormulas = "";
		for (let j = 0; j < inputs[i].formulas.length; j++) {
			definedFormulas += `\t${inputs[i].formulas[j]}`;
			if (j != inputs[i].formulas.length - 1) {
				definedFormulas += "\n";
			}
		}
		it(`Should evaluate ${inputs[i].in} to ${inputs[i].out} using these formula(s):\n ${definedFormulas}`, () => {
			for (let j = 0; j < inputs[i].formulas.length; j++) {
				workspace.defineFormula(inputs[i].formulas[j]);
			}
			let result = workspace.evaluate(inputs[i].in);
			expect(result).to.equal(inputs[i].out);
			workspace.clear();
		});
	}
})