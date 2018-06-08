"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ExpressionLexer_1 = require("./ExpressionLexer/ExpressionLexer");
function evaluate(expression) {
    var lexer = new ExpressionLexer_1.ExpressionLexer(expression);
    var tokens = lexer.lex();
    return 0;
}
exports.evaluate = evaluate;
