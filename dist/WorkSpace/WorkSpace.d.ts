import { SyntaxNode } from "../ExpressionParser/SyntaxTree/SyntaxNode";
import { EvaluationTree } from "../ExpressionParser/EvaluationTree/EvaluationTree";
export declare class WorkSpace {
    private formulaMapping;
    private functionMapping;
    constructor();
    private defineConstants;
    defineFormula(formula: string): void;
    private defineFunctions;
    private toDegrees;
    private toRadians;
    hasFormula(variable: string): boolean;
    hasFunction(name: string): boolean;
    getFormula(variable: string): EvaluationTree;
    getFunction(name: string): Function;
    getFormulaResultUnit(variable: string): SyntaxNode;
    private cloneResultUnit;
    evaluate(expression: string): string;
    clear(): void;
}
