"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Token = /** @class */ (function () {
    function Token(tokenType, data, pos) {
        this.tokenType = tokenType;
        this.pos = pos;
        this.data = data;
    }
    Token.prototype.getTokenType = function () {
        return this.tokenType;
    };
    Token.prototype.getPos = function () {
        return this.pos;
    };
    Token.prototype.getData = function () {
        return this.data;
    };
    Token.prototype.setData = function (data) {
        this.data = data;
    };
    return Token;
}());
exports.Token = Token;
