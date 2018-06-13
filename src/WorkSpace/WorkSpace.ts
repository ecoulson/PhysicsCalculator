import { ExpressionParser } from "../ExpressionParser/ExpressionParser";

export class WorkSpace {
	private formulaMapping : { [variable: string]: ExpressionParser}

	constructor() {
		this.formulaMapping = {};
	}

	public defineFormula(formula: string) {
		let formulaParts : Array<string> = formula.split('=');
		let variable : string = formulaParts[0];
		let expression : string = formulaParts[1];
		let parser : ExpressionParser = new ExpressionParser(expression);
		this.formulaMapping[variable] = parser;
	}

	public evaluate(expression: string) {
		let parser : ExpressionParser = new ExpressionParser(expression);
		return parser.evaluate("");
	}
}