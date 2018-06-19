"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ExpressionLexer_1 = require("./ExpressionLexer/ExpressionLexer");
var SyntaxTree_1 = require("./SyntaxTree/SyntaxTree");
var EvaluationTree_1 = require("./EvaluationTree/EvaluationTree");
var ExpressionParser = /** @class */ (function () {
    function ExpressionParser(expression, workspace) {
        var lexer = new ExpressionLexer_1.ExpressionLexer(expression);
        var tokens = lexer.lex();
        this.syntaxTree = new SyntaxTree_1.SyntaxTree(tokens);
        this.syntaxTree.build();
        this.evaluationTree = new EvaluationTree_1.EvaluationTree(this.syntaxTree, workspace);
    }
    ExpressionParser.prototype.evaluate = function () {
        return this.evaluationTree.evaluate();
    };
    return ExpressionParser;
}());
exports.ExpressionParser = ExpressionParser;
