import { ExpressionParser } from "../src/ExpressionParser/ExpressionParser";
import { expect } from "chai";
import { readInputFile } from "./Helpers/InputHelper";
const inputs: Array<any> = readInputFile("ExpressionParserInputs");

describe("ExpressionParser test suite", () => {
	for (let i = 0; i < inputs.length; i++) {
		if (inputs[i].hasOwnProperty("variable")) {
			it(`Should evaluate ${inputs[i].in} to ${inputs[i].out} where x=${inputs[i].variable}`, () => {
				let parser = new ExpressionParser(inputs[i].in);
				let result = parser.evaluate(inputs[i].variable);
				expect(result).to.equal(inputs[i].out);
			})
		} else {
			it(`Should evaluate ${inputs[i].in} to ${inputs[i].out}`, () => {
				let parser = new ExpressionParser(inputs[i].in);
				let result = parser.evaluate("");
				expect(result).to.equal(inputs[i].out);
			})
		}
	}
})