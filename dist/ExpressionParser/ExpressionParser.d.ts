import { EvaluationTree } from "./EvaluationTree/EvaluationTree";
import { WorkSpace } from "../WorkSpace/WorkSpace";
export declare class ExpressionParser {
    private syntaxTree;
    evaluationTree: EvaluationTree;
    constructor(expression: string, workspace: WorkSpace);
    evaluate(): string;
}
