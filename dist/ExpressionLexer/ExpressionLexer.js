"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Token_1 = require("./Token");
var TokenType_1 = require("./TokenType");
var UnrecognizedTokenError_1 = require("./UnrecognizedTokenError");
var DIGIT_REGEX = /\d/;
var LETTER_REGEX = /^[a-zA-Z]+$/;
var WHITESPACE_REGEX = /\s/;
var ExpressionLexer = /** @class */ (function () {
    function ExpressionLexer(expression) {
        this.offset = 0;
        this.expression = expression;
    }
    ExpressionLexer.prototype.lex = function () {
        var tokens = [];
        while (!this.isEndOfExpression()) {
            var ch = this.expression[this.offset++];
            var token = this.createToken(ch);
            //disregard whitespace tokens
            if (token.getTokenType() != TokenType_1.TokenType.Whitespace) {
                tokens.push(token);
            }
        }
        return tokens;
    };
    ExpressionLexer.prototype.isEndOfExpression = function () {
        return this.offset == this.expression.length;
    };
    ExpressionLexer.prototype.createToken = function (char) {
        if (this.isDigit(char)) {
            return this.readNumberToken(char);
        }
        else if (LETTER_REGEX.test(char)) {
            return this.readIdentifierToken(char);
        }
        else if (WHITESPACE_REGEX.test(char)) {
            return new Token_1.Token(TokenType_1.TokenType.Whitespace, '', -1);
        }
        else {
            var pos = this.offset - 1;
            switch (char) {
                case '+':
                    return new Token_1.Token(TokenType_1.TokenType.Add, '+', pos);
                case '-':
                    return new Token_1.Token(TokenType_1.TokenType.Subtract, '-', pos);
                case '*':
                    return new Token_1.Token(TokenType_1.TokenType.Multiply, '*', pos);
                case '/':
                    return new Token_1.Token(TokenType_1.TokenType.Divide, '/', pos);
                case '^':
                    return new Token_1.Token(TokenType_1.TokenType.Exponentiate, '^', pos);
                case '|':
                    return new Token_1.Token(TokenType_1.TokenType.Absolute, '|', pos);
                case '(':
                    return new Token_1.Token(TokenType_1.TokenType.LeftParentheses, '(', pos);
                case ')':
                    return new Token_1.Token(TokenType_1.TokenType.RightParentheses, ')', pos);
                default:
                    throw new UnrecognizedTokenError_1.UnrecognizedTokenError("Unrecognized Token: " + char + " at position " + pos);
            }
        }
    };
    ExpressionLexer.prototype.isDigit = function (char) {
        return DIGIT_REGEX.test(char) || char == '.';
    };
    ExpressionLexer.prototype.isLetter = function (char) {
        return LETTER_REGEX.test(char);
    };
    ExpressionLexer.prototype.readNumberToken = function (char) {
        var pos = this.offset - 1;
        var number = char;
        if (this.isDigit(this.peek())) {
            while (!this.isEndOfExpression() && this.isDigit(char)) {
                number += this.expression[this.offset++];
                char = this.expression[this.offset];
            }
        }
        return new Token_1.Token(TokenType_1.TokenType.Number, number, pos);
    };
    ExpressionLexer.prototype.readIdentifierToken = function (char) {
        var pos = this.offset - 1;
        var identifier = char;
        if (this.isLetter(this.peek())) {
            while (!this.isEndOfExpression() && this.isLetter(char)) {
                identifier += this.expression[this.offset++];
                char = this.expression[this.offset];
            }
        }
        return new Token_1.Token(TokenType_1.TokenType.Identifier, identifier, pos);
    };
    ExpressionLexer.prototype.peek = function () {
        return this.expression[this.offset];
    };
    return ExpressionLexer;
}());
exports.ExpressionLexer = ExpressionLexer;
