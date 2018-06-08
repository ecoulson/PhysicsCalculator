import { UnitNode } from "../SyntaxTree/UnitNode";

export class UnitStruct {
	public denominator: Array<UnitNode>;
	public nominator: Array<UnitNode>;

	constructor() {
		this.denominator = [];
		this.nominator = [];
	}
}