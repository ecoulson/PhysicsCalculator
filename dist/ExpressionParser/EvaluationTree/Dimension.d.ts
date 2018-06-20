export declare class Dimension {
    unit: string;
    degree: number;
    hasDimension: boolean;
    constructor(unit: string, degree: number);
    toString(): string;
    equals(other: Dimension): boolean;
}
