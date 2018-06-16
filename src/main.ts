import { ExpressionLexer } from "./ExpressionParser/ExpressionLexer/ExpressionLexer";
import { Token } from "./ExpressionParser/ExpressionLexer/Token";
import { SyntaxTree } from "./ExpressionParser/SyntaxTree/SyntaxTree";
import { EvaluationTree } from "./ExpressionParser/EvaluationTree/EvaluationTree";

let lexer : ExpressionLexer = new ExpressionLexer("1N / 5m^2");
let tokens : Array<Token> = lexer.lex();
let tree : SyntaxTree = new SyntaxTree(tokens);
tree.build();
let evaluationTree = new EvaluationTree(tree, null);
let unitStruct : string = evaluationTree.evaluateUnits();
console.log(unitStruct);