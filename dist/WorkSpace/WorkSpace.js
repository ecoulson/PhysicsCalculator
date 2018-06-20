"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ExpressionParser_1 = require("../ExpressionParser/ExpressionParser");
var NodeTypes_1 = require("../ExpressionParser/SyntaxTree/NodeTypes");
var NumberNode_1 = require("../ExpressionParser/SyntaxTree/NumberNode");
var UnitNode_1 = require("../ExpressionParser/SyntaxTree/UnitNode");
var OperatorNode_1 = require("../ExpressionParser/SyntaxTree/OperatorNode");
var WorkSpace = /** @class */ (function () {
    function WorkSpace() {
        this.formulaMapping = {};
        this.functionMapping = {};
        this.defineConstants();
        this.defineFunctions();
    }
    WorkSpace.prototype.defineConstants = function () {
        this.defineFormula("\\epsilon_{o} = 8.85F/m * 10^-12");
        this.defineFormula("e = " + Math.E.toString());
        this.defineFormula("\\pi = " + Math.PI.toString());
        this.defineFormula("g = -9.8m/s^2");
        this.defineFormula("k = 9.0N*m^2/C^2 * 10^9");
        this.defineFormula("c = 3.0m/s * 10^8");
    };
    WorkSpace.prototype.defineFormula = function (formula) {
        var formulaParts = formula.split('=');
        var variable = formulaParts[0].trim();
        var expression = formulaParts[1].trim();
        var parser = new ExpressionParser_1.ExpressionParser(expression, this);
        this.formulaMapping[variable] = parser;
    };
    WorkSpace.prototype.defineFunctions = function () {
        var _this = this;
        this.functionMapping["sqrt"] = function (x) {
            return Math.sqrt(x);
        };
        this.functionMapping["abs"] = function (x) {
            return Math.abs(x);
        };
        this.functionMapping["acos"] = function (x) {
            return _this.toDegrees(Math.acos(x));
        };
        this.functionMapping["asin"] = function (x) {
            return _this.toDegrees(Math.asin(x));
        };
        this.functionMapping["atan"] = function (x) {
            return _this.toDegrees(Math.atan(x));
        };
        this.functionMapping["cos"] = function (x) {
            return Math.cos(_this.toRadians(x));
        };
        this.functionMapping["sin"] = function (x) {
            return Math.sin(_this.toRadians(x));
        };
        this.functionMapping["tan"] = function (x) {
            return Math.tan(_this.toRadians(x));
        };
        this.functionMapping["exp"] = function (x) {
            return Math.exp(x);
        };
        this.functionMapping["log"] = function (x) {
            return Math.log(x);
        };
    };
    WorkSpace.prototype.toDegrees = function (x) {
        return x * 180 / Math.PI;
    };
    WorkSpace.prototype.toRadians = function (x) {
        return x * Math.PI / 180;
    };
    WorkSpace.prototype.hasFormula = function (variable) {
        return this.formulaMapping.hasOwnProperty(variable);
    };
    WorkSpace.prototype.hasFunction = function (name) {
        return this.functionMapping.hasOwnProperty(name);
    };
    WorkSpace.prototype.getFormula = function (variable) {
        return this.formulaMapping[variable].evaluationTree;
    };
    WorkSpace.prototype.getFunction = function (name) {
        return this.functionMapping[name];
    };
    WorkSpace.prototype.getFormulaResultUnit = function (variable) {
        var unitRoot = this.formulaMapping[variable].evaluationTree.unitRoot;
        return this.cloneResultUnit(unitRoot);
    };
    WorkSpace.prototype.cloneResultUnit = function (node) {
        if (node == null) {
            return node;
        }
        else if (node.type == NodeTypes_1.NodeType.Number) {
            var numberNode = node;
            var newNumber = NumberNode_1.NumberNode.createNode(numberNode.number);
            return newNumber;
        }
        else if (node.type == NodeTypes_1.NodeType.Unit) {
            var unitNode = node;
            var newUnit = UnitNode_1.UnitNode.createNode(unitNode.unit);
            newUnit.degree = unitNode.degree;
            return newUnit;
        }
        else if (node.type == NodeTypes_1.NodeType.Operator) {
            var operatorNode = node;
            var newOperator = OperatorNode_1.OperatorNode.createNode(operatorNode.operator);
            newOperator.left = this.cloneResultUnit(node.left);
            newOperator.right = this.cloneResultUnit(node.right);
            return newOperator;
        }
        else {
            throw new Error("Illegal NodeType in UnitTree");
        }
    };
    WorkSpace.prototype.evaluate = function (expression) {
        var parser = new ExpressionParser_1.ExpressionParser(expression, this);
        return parser.evaluate();
    };
    WorkSpace.prototype.clear = function () {
        this.formulaMapping = {};
        this.defineConstants();
    };
    return WorkSpace;
}());
exports.WorkSpace = WorkSpace;
