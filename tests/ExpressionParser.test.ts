import { ExpressionParser } from "../src/ExpressionParser/ExpressionParser";
import { expect } from "chai";
import { readInputFile } from "./Helpers/InputHelper";
import { WorkSpace } from "../src/WorkSpace/WorkSpace";
const inputs: Array<any> = readInputFile("ExpressionParserInputs");

describe("ExpressionParser test suite", () => {
	for (let i = 0; i < inputs.length; i++) {
		it(`Should evaluate ${inputs[i].in} to ${inputs[i].out}`, () => {
			let parser = new ExpressionParser(inputs[i].in, new WorkSpace());
			let result = parser.evaluate();
			expect(result).to.equal(inputs[i].out);
		})
	}
})