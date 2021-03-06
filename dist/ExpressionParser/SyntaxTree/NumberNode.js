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
var NumberNode = /** @class */ (function (_super) {
    __extends(NumberNode, _super);
    function NumberNode(token) {
        var _this = _super.call(this, NodeTypes_1.NodeType.Number) || this;
        _this.number = parseFloat(token.getData());
        return _this;
    }
    NumberNode.createNode = function (number) {
        var token = new Token_1.Token(TokenType_1.TokenType.Number, number.toString(), -1);
        var node = new NumberNode(token);
        return node;
    };
    return NumberNode;
}(SyntaxNode_1.SyntaxNode));
exports.NumberNode = NumberNode;
