"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Dimension = /** @class */ (function () {
    function Dimension(unit, degree) {
        this.unit = unit;
        this.degree = degree;
        this.hasDimension = unit != null;
    }
    Dimension.prototype.toString = function () {
        if (this.degree == 1) {
            return "" + this.unit;
        }
        else {
            return this.unit + "^" + this.degree;
        }
    };
    Dimension.prototype.equals = function (other) {
        if (other.hasDimension !== this.hasDimension) {
            return true;
        }
        else if (other.hasDimension && this.hasDimension) {
            return other.unit == this.unit && other.degree == this.degree;
        }
        else {
            return false;
        }
    };
    return Dimension;
}());
exports.Dimension = Dimension;
