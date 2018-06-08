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
var OperatorNode = /** @class */ (function (_super) {
    __extends(OperatorNode, _super);
    function OperatorNode(token) {
        var _this = _super.call(this, NodeTypes_1.NodeType.Operator) || this;
        _this.operator = token.getTokenType();
        return _this;
    }
    return OperatorNode;
}(SyntaxNode_1.SyntaxNode));
exports.OperatorNode = OperatorNode;
