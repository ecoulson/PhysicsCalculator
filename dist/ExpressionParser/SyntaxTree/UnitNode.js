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
var UnitNode = /** @class */ (function (_super) {
    __extends(UnitNode, _super);
    function UnitNode(token) {
        var _this = _super.call(this, NodeTypes_1.NodeType.Unit) || this;
        _this.unit = token.getData();
        _this.degree = 1;
        _this.prefix = "";
        _this.base = _this.unit;
        return _this;
    }
    UnitNode.createNode = function (unit) {
        var token = new Token_1.Token(TokenType_1.TokenType.Identifier, unit, -1);
        return new UnitNode(token);
    };
    return UnitNode;
}(SyntaxNode_1.SyntaxNode));
exports.UnitNode = UnitNode;
