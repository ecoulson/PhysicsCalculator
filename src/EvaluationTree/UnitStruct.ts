import { UnitNode } from "../SyntaxTree/UnitNode";
import { Unit } from "./Unit";

export class UnitStruct {
	public levels: Array<Array<Unit>>;
	public currentLevel: Array<Unit>;

	constructor() {
		this.currentLevel = [];
		this.levels = [this.currentLevel];
	}

	addLevel() {
		this.currentLevel = [];
		this.levels.push(this.currentLevel);
	}

	public toString() : string {
		let str : string = "";
		for (let i = 0; i < this.levels.length; i++) {
			for (let j = 0; j < this.levels[i].length; j++) {
				if (this.levels[i][j].degree != 1) {
					str += this.levels[i][j].unit + "^" + str + this.levels[i][j].degree;
				} else {
					str += this.levels[i][j].unit;
				}
			}
			if (i != this.levels.length - 1) {
				str += "/";
			}
		}
		return str;
	}

	public levelHasUnit(unit: string) : boolean {
		for (let i = 0; i < this.currentLevel.length; i++) {
			if (this.currentLevel[i].unit == unit) {
				return true;
			}
		}
		return false;
	}

	public changeDegree(unit: string, delta: number) {
		for (let i = 0; i < this.currentLevel.length; i++) {
			if (this.currentLevel[i].unit == unit) {
				this.currentLevel[i].degree += delta;
			}
		}
	}
}