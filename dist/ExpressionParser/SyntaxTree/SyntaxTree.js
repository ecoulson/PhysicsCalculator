"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Token_1 = require("../ExpressionLexer/Token");
var NumberNode_1 = require("./NumberNode");
var TokenType_1 = require("../ExpressionLexer/TokenType");
var UnitNode_1 = require("./UnitNode");
var UnexpectedTokenError_1 = require("./UnexpectedTokenError");
var OperatorNode_1 = require("./OperatorNode");
var VariableNode_1 = require("./VariableNode");
var InvokeNode_1 = require("./InvokeNode");
var AbsoluteNode_1 = require("./AbsoluteNode");
var fs_1 = require("fs");
var path_1 = require("path");
var UnitInfoDir = path_1.resolve(__dirname, "../UnitInfo");
var UNITS = JSON.parse(fs_1.readFileSync(path_1.resolve(UnitInfoDir, "Units.json"), "utf-8"));
var PREFIXES = JSON.parse(fs_1.readFileSync(path_1.resolve(UnitInfoDir, "Prefixes.json"), "utf-8"));
var SyntaxTree = /** @class */ (function () {
    function SyntaxTree(tokens) {
        this.tokens = tokens;
        this.root = null;
        this.offset = 0;
    }
    SyntaxTree.prototype.hasReadAllTokens = function () {
        return this.offset >= this.tokens.length;
    };
    SyntaxTree.prototype.isNextToken = function (type) {
        return this.tokens[this.offset].getTokenType() == type;
    };
    SyntaxTree.prototype.readToken = function () {
        return this.tokens[this.offset++];
    };
    SyntaxTree.prototype.build = function () {
        this.root = this.readSums();
    };
    SyntaxTree.prototype.readSums = function () {
        var node = this.readFactor();
        while (!this.hasReadAllTokens() &&
            !this.isNextToken(TokenType_1.TokenType.Absolute) &&
            !this.isNextToken(TokenType_1.TokenType.RightParentheses) &&
            (this.isNextToken(TokenType_1.TokenType.Add) || this.isNextToken(TokenType_1.TokenType.Subtract))) {
            var operatorToken = this.readToken();
            var operatorNode = new OperatorNode_1.OperatorNode(operatorToken);
            var rightNode = this.readFactor();
            operatorNode.left = node;
            operatorNode.right = rightNode;
            node = operatorNode;
        }
        return node;
    };
    SyntaxTree.prototype.readFactor = function () {
        var node = this.readExponent();
        while (!this.hasReadAllTokens() &&
            (this.isNextToken(TokenType_1.TokenType.Multiply) ||
                this.isNextToken(TokenType_1.TokenType.Divide))) {
            var operatorToken = this.readToken();
            var operatorNode = new OperatorNode_1.OperatorNode(operatorToken);
            var rightNode = this.readExponent();
            operatorNode.left = node;
            operatorNode.right = rightNode;
            node = operatorNode;
        }
        return node;
    };
    SyntaxTree.prototype.readExponent = function () {
        var node = this.readParentheses();
        while (!this.hasReadAllTokens() && this.isNextToken(TokenType_1.TokenType.Exponentiate)) {
            var operatorToken = this.readToken();
            var operatorNode = new OperatorNode_1.OperatorNode(operatorToken);
            var rightNode = this.readParentheses();
            operatorNode.left = node;
            operatorNode.right = rightNode;
            node = operatorNode;
        }
        return node;
    };
    SyntaxTree.prototype.readParentheses = function () {
        if (!this.hasReadAllTokens() && this.isNextToken(TokenType_1.TokenType.LeftParentheses)) {
            this.readToken();
            var node = this.readSums();
            this.readToken();
            return node;
        }
        else if (!this.hasReadAllTokens() && this.isNextToken(TokenType_1.TokenType.Absolute)) {
            this.readToken();
            var node = new AbsoluteNode_1.AbsoluteNode();
            var expression = this.readSums();
            node.right = expression;
            this.readToken();
            return node;
        }
        else {
            return this.readTerm();
        }
    };
    SyntaxTree.prototype.readTerm = function () {
        var signToken = this.readSign();
        if (!this.hasReadAllTokens() && this.isNextToken(TokenType_1.TokenType.Number)) {
            var numberNode = this.readNumber(signToken);
            numberNode = this.addUnits(numberNode);
            return numberNode;
        }
        else if (!this.hasReadAllTokens() && this.isNextToken(TokenType_1.TokenType.Identifier)) {
            var node = this.readVariable();
            node = this.transformNodeIfInvoke(node);
            node = this.transformNodeIfNegative(node, signToken);
            return node;
        }
        else if (!this.hasReadAllTokens()) {
            var token = this.readToken();
            throw new UnexpectedTokenError_1.UnexpectedTokenError("Unexpected token type " + token.getTokenType() + " at position " + token.getPos());
        }
        else {
            throw new Error("Out of Tokens");
        }
    };
    SyntaxTree.prototype.readSign = function () {
        var sign = 1;
        var pos = this.offset;
        while (!this.hasReadAllTokens() && this.isNextToken(TokenType_1.TokenType.Subtract)) {
            sign *= -1;
            this.readToken();
        }
        return new Token_1.Token(TokenType_1.TokenType.Number, sign.toString(), pos);
    };
    SyntaxTree.prototype.readNumber = function (sign) {
        if (this.isNextToken(TokenType_1.TokenType.Number)) {
            var numberToken = this.readToken();
            var signedValue = parseInt(sign.getData()) * parseFloat(numberToken.getData());
            numberToken.setData(signedValue.toString());
            return new NumberNode_1.NumberNode(numberToken);
        }
        else {
            var errorToken = this.readToken();
            throw new UnexpectedTokenError_1.UnexpectedTokenError("Unexpected " + errorToken.getTokenType() + " token at position " + errorToken.getPos());
        }
    };
    SyntaxTree.prototype.addUnits = function (node) {
        if (!this.hasReadAllTokens() && this.isNextToken(TokenType_1.TokenType.Identifier)) {
            var unitNode = this.readComplexUnit();
            node.right = unitNode;
            return node;
        }
        else {
            return node;
        }
    };
    SyntaxTree.prototype.readVariable = function () {
        if (this.isNextToken(TokenType_1.TokenType.Identifier)) {
            var variableToken = this.readToken();
            return new VariableNode_1.VariableNode(variableToken);
        }
        else {
            var errorToken = this.readToken();
            throw new UnexpectedTokenError_1.UnexpectedTokenError("Unexpected " + errorToken.getTokenType() + " token at position " + errorToken.getPos());
        }
    };
    SyntaxTree.prototype.transformNodeIfInvoke = function (node) {
        if (!this.hasReadAllTokens() && this.isNextToken(TokenType_1.TokenType.LeftParentheses)) {
            this.readToken();
            var invokeNode = new InvokeNode_1.InvokeNode();
            var invokeExpression = this.readSums();
            invokeNode.left = node;
            invokeNode.right = invokeExpression;
            node = invokeNode;
            this.readToken();
            return node;
        }
        else {
            return node;
        }
    };
    SyntaxTree.prototype.transformNodeIfNegative = function (node, sign) {
        if (sign.getData() == "-1") {
            var signToken = new Token_1.Token(TokenType_1.TokenType.Multiply, "*", sign.getPos());
            var signOperatorNode = new OperatorNode_1.OperatorNode(signToken);
            var numberToken = new Token_1.Token(TokenType_1.TokenType.Number, "-1", -1);
            signOperatorNode.left = new NumberNode_1.NumberNode(numberToken);
            signOperatorNode.right = node;
            node = signOperatorNode;
            return node;
        }
        else {
            return node;
        }
    };
    SyntaxTree.prototype.readComplexUnit = function () {
        var node = this.readExponentUnit();
        if (!this.hasReadAllTokens()) {
        }
        while (!this.hasReadAllTokens() &&
            (this.isNextToken(TokenType_1.TokenType.Divide) ||
                this.isNextToken(TokenType_1.TokenType.Multiply)) &&
            this.tokens[this.offset + 1].getTokenType() != TokenType_1.TokenType.Number &&
            this.tokens[this.offset + 1].getTokenType() != TokenType_1.TokenType.LeftParentheses &&
            (this.tokens[this.offset + 1].getTokenType() == TokenType_1.TokenType.Identifier &&
                UNITS.indexOf(this.getBaseUnit(this.tokens[this.offset + 1].getData())) != -1)) {
            var operatorToken = this.readToken();
            var operatorNode = new OperatorNode_1.OperatorNode(operatorToken);
            var rightNode = this.readExponentUnit();
            operatorNode.left = node;
            operatorNode.right = rightNode;
            node = operatorNode;
        }
        return node;
    };
    SyntaxTree.prototype.getBaseUnit = function (unit) {
        if (unit == "decays" || unit == "cycles") {
            return unit;
        }
        if (UNITS.indexOf(unit) != -1) {
            return unit;
        }
        else {
            var prefix = unit[0];
            var base = unit.substring(1, unit.length);
            if (prefix == "\\") {
                prefix = unit.substring(0, 3);
                base = unit.substring(3, unit.length);
            }
            if (PREFIXES.hasOwnProperty(prefix) && UNITS.indexOf(base) != -1 || base == "g") {
                if (base == "g") {
                    return "kg";
                }
                return base;
            }
            else {
                if (unit == "g") {
                    return "kg";
                }
                return unit;
            }
        }
    };
    SyntaxTree.prototype.readExponentUnit = function () {
        var node = this.readSimpleUnit();
        while (!this.hasReadAllTokens() && this.isNextToken(TokenType_1.TokenType.Exponentiate)) {
            var operatorToken = this.readToken();
            var operatorNode = new OperatorNode_1.OperatorNode(operatorToken);
            var sign = this.readSign();
            var rightNode = this.readNumber(sign);
            operatorNode.left = node;
            operatorNode.right = rightNode;
            node = operatorNode;
        }
        return node;
    };
    SyntaxTree.prototype.readSimpleUnit = function () {
        if (this.isNextToken(TokenType_1.TokenType.Identifier)) {
            var identifierToken = this.readToken();
            return new UnitNode_1.UnitNode(identifierToken);
        }
        else {
            var errorToken = this.readToken();
            throw new UnexpectedTokenError_1.UnexpectedTokenError("Unexpected " + errorToken.getTokenType() + " token at position " + errorToken.getPos());
        }
    };
    return SyntaxTree;
}());
exports.SyntaxTree = SyntaxTree;
