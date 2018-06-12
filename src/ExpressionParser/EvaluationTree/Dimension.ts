export class Dimension {
	public unit: string;
	public degree: number;
	public hasDimension: boolean;

	constructor(unit: string, degree: number) {
		this.unit = unit;
		this.degree = degree;
		this.hasDimension = unit != null;
	}

	public toString(): string {
		if (this.degree == 1) {
			return `${this.unit}`;
		} else {
			return `${this.unit}^${this.degree}`;
		}
	}

	public equals(other: Dimension) {
		if (other.hasDimension !== this.hasDimension) {
			return true;
		} else if (other.hasDimension && this.hasDimension) {
			return other.unit == this.unit && other.degree == this.degree;
		} else {
			return false;
		}
	}
}