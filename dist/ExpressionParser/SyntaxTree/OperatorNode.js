"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var SyntaxNode_1 = require("./SyntaxNode");
var NodeTypes_1 = require("./NodeTypes");
var Token_1 = require("../ExpressionLexer/Token");
var TokenType_1 = require("../ExpressionLexer/TokenType");
var UnitNode_1 = require("./UnitNode");
var IllegalOperatorError_1 = require("../EvaluationTree/IllegalOperatorError");
var OperatorNode = /** @class */ (function (_super) {
    __extends(OperatorNode, _super);
    function OperatorNode(token) {
        var _this = _super.call(this, NodeTypes_1.NodeType.Operator) || this;
        _this.operator = token.getTokenType();
        return _this;
    }
    OperatorNode.createNode = function (operator) {
        var type = this.getOperatorType(operator);
        var token = new Token_1.Token(type, operator, -1);
        return new OperatorNode(token);
    };
    OperatorNode.getOperatorType = function (operator) {
        switch (operator) {
            case '+':
                return TokenType_1.TokenType.Add;
            case '-':
                return TokenType_1.TokenType.Subtract;
            case '*':
                return TokenType_1.TokenType.Multiply;
            case '/':
                return TokenType_1.TokenType.Divide;
            case '^':
                return TokenType_1.TokenType.Exponentiate;
            default:
                throw new IllegalOperatorError_1.IllegalOperatorError("Illegal Operator " + operator);
        }
    };
    OperatorNode.prototype.setResultUnit = function (unit) {
        var token = new Token_1.Token(TokenType_1.TokenType.Identifier, unit, -1);
        this.resultUnit = new UnitNode_1.UnitNode(token);
    };
    return OperatorNode;
}(SyntaxNode_1.SyntaxNode));
exports.OperatorNode = OperatorNode;
