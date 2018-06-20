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
var UnrecognizedTokenError = /** @class */ (function (_super) {
    __extends(UnrecognizedTokenError, _super);
    function UnrecognizedTokenError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = "UnrecognizedTokenError";
        return _this;
    }
    return UnrecognizedTokenError;
}(Error));
exports.UnrecognizedTokenError = UnrecognizedTokenError;
