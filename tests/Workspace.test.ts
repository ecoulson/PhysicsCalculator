import { expect } from "chai";
import { WorkSpace } from "../src/WorkSpace/WorkSpace";
import { readInputFile } from "./Helpers/InputHelper";

const workspace : WorkSpace = new WorkSpace();
const inputs: Array<any> = readInputFile("ExpressionParserInputs");

describe("Workspace Test Suite", () => {
	it("Should define formula");

	it("Should evaluate an expression");
})