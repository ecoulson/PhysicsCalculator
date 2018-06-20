"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var NodeTypes_1 = require("../SyntaxTree/NodeTypes");
var NumberNode_1 = require("../SyntaxTree/NumberNode");
var OperatorNode_1 = require("../SyntaxTree/OperatorNode");
var IllegalOperatorError_1 = require("./IllegalOperatorError");
var UnitNode_1 = require("../SyntaxTree/UnitNode");
var IllegalNodeError_1 = require("./IllegalNodeError");
var IllegalUnitOperationError_1 = require("./IllegalUnitOperationError");
var Dimension_1 = require("./Dimension");
var fs_1 = require("fs");
var path_1 = require("path");
var ExpressionParser_1 = require("../ExpressionParser");
var UndefinedVariableError_1 = require("./UndefinedVariableError");
var UndefinedFunctionError_1 = require("./UndefinedFunctionError");
var UnitInfoDir = path_1.resolve(__dirname, "../UnitInfo");
var DERIVED_UNITS = JSON.parse(fs_1.readFileSync(path_1.resolve(UnitInfoDir, "DerivedUnits.json"), "utf-8"));
var PREFIXES = JSON.parse(fs_1.readFileSync(path_1.resolve(UnitInfoDir, "Prefixes.json"), "utf-8"));
var UNITS = JSON.parse(fs_1.readFileSync(path_1.resolve(UnitInfoDir, "Units.json"), "utf-8"));
var BASE_UNITS = JSON.parse(fs_1.readFileSync(path_1.resolve(UnitInfoDir, "BaseUnits.json"), "utf-8"));
var DIMENSIONLESS_UNITS = JSON.parse(fs_1.readFileSync(path_1.resolve(UnitInfoDir, "DimensionlessUnits.json"), "utf-8"));
var EvaluationTree = /** @class */ (function () {
    function EvaluationTree(tree, workspace) {
        this.base10Exp = 0;
        this.workspace = workspace;
        this.root = tree.root;
        this.unitRoot = this.buildUnitTree();
        this.base10Exp += this.getBase10Exponent(this.unitRoot);
    }
    EvaluationTree.prototype.buildUnitTree = function () {
        return this.buildUnitTreeHelper(this.root);
    };
    EvaluationTree.prototype.buildUnitTreeHelper = function (node) {
        if (node.type == NodeTypes_1.NodeType.Number) {
            if (node.right == null) {
                return null;
            }
            else {
                return this.convertToSIUnits(node.right);
            }
        }
        else if (node.type == NodeTypes_1.NodeType.Variable) {
            var variableNode = node;
            if (this.workspace.hasFormula(variableNode.variable)) {
                return this.workspace.getFormulaResultUnit(variableNode.variable);
            }
            else {
                throw new UndefinedVariableError_1.UndefinedVariableError("Undefined Variable " + variableNode.variable + " in workspace");
            }
        }
        else if (node.type == NodeTypes_1.NodeType.Invoke) {
            var variableNode = node.left;
            if (variableNode.variable == "sqrt") {
                var nonSqrtedUnit = this.buildUnitTreeHelper(node.right);
                var raised = this.raiseLeftUnitBy(nonSqrtedUnit, 0.5);
                return raised;
            }
            else {
                return this.buildUnitTreeHelper(node.right);
            }
        }
        else if (node.type == NodeTypes_1.NodeType.Absolute) {
            return this.buildUnitTreeHelper(node.right);
        }
        else if (node.type == NodeTypes_1.NodeType.Operator) {
            var operatorNode = node;
            var leftUnit = this.buildUnitTreeHelper(node.left);
            var rightUnit = this.buildUnitTreeHelper(node.right);
            var unitOperator = void 0;
            switch (operatorNode.operator) {
                case '+':
                    unitOperator = OperatorNode_1.OperatorNode.createNode('+');
                    unitOperator.left = leftUnit;
                    unitOperator.right = rightUnit;
                    return unitOperator;
                case '-':
                    unitOperator = OperatorNode_1.OperatorNode.createNode('-');
                    unitOperator.left = leftUnit;
                    unitOperator.right = rightUnit;
                    return unitOperator;
                case '*':
                    unitOperator = OperatorNode_1.OperatorNode.createNode('*');
                    unitOperator.left = leftUnit;
                    unitOperator.right = rightUnit;
                    return unitOperator;
                case '/':
                    unitOperator = OperatorNode_1.OperatorNode.createNode('/');
                    unitOperator.left = leftUnit;
                    unitOperator.right = rightUnit;
                    return unitOperator;
                case '^':
                    if (this.shouldRaiseSubtree(node)) {
                        var numberNode = node.right;
                        leftUnit = this.raiseLeftUnitBy(leftUnit, numberNode.number);
                        return leftUnit;
                    }
                    else {
                        unitOperator = OperatorNode_1.OperatorNode.createNode('^');
                        unitOperator.left = leftUnit;
                        unitOperator.right = rightUnit;
                        return unitOperator;
                    }
                default:
                    throw new IllegalOperatorError_1.IllegalOperatorError("Illegal Operator " + operatorNode.operator);
            }
        }
    };
    EvaluationTree.prototype.convertToSIUnits = function (node) {
        if (node == null) {
            return null;
        }
        else if (node.type == NodeTypes_1.NodeType.Unit) {
            var unitNode = node;
            if (DERIVED_UNITS.hasOwnProperty(unitNode.base)) {
                //TODO: move all derived units expressionparsers into the workspace class
                var unitParser = new ExpressionParser_1.ExpressionParser(DERIVED_UNITS[unitNode.base], this.workspace);
                unitParser.evaluate();
                return unitParser.evaluationTree.unitRoot;
            }
            else {
                var prefix = this.getPrefix(unitNode);
                var base = this.getBaseUnit(unitNode.unit);
                unitNode.base = base;
                if (DERIVED_UNITS.hasOwnProperty(base)) {
                    this.base10Exp += PREFIXES[prefix];
                    return this.convertToSIUnits(unitNode);
                }
                else {
                    unitNode.prefix = prefix;
                    return unitNode;
                }
            }
        }
        else if (node.type == NodeTypes_1.NodeType.Operator) {
            node.left = this.convertToSIUnits(node.left);
            node.right = this.convertToSIUnits(node.right);
            return node;
        }
        else {
            return node;
        }
    };
    EvaluationTree.prototype.shouldRaiseSubtree = function (node) {
        return (node.left.type == NodeTypes_1.NodeType.Variable || node.left.type == NodeTypes_1.NodeType.Operator) && node.right.type == NodeTypes_1.NodeType.Number;
    };
    EvaluationTree.prototype.raiseLeftUnitBy = function (node, degree) {
        if (node == null) {
            return node;
        }
        else if (node.type == NodeTypes_1.NodeType.Number) {
            var numberNode = node;
            numberNode.number *= degree;
            var newNumber = NumberNode_1.NumberNode.createNode(numberNode.number);
            return newNumber;
        }
        else if (node.type == NodeTypes_1.NodeType.Unit) {
            var unitNode = node;
            var newUnit = UnitNode_1.UnitNode.createNode(unitNode.unit);
            newUnit.degree = unitNode.degree * degree;
            return newUnit;
        }
        else if (node.type == NodeTypes_1.NodeType.Operator) {
            var operatorNode = node;
            var newOperator = OperatorNode_1.OperatorNode.createNode(operatorNode.operator);
            newOperator.left = this.raiseLeftUnitBy(node.left, degree);
            newOperator.right = this.raiseLeftUnitBy(node.right, degree);
            return newOperator;
        }
        else {
            return node;
        }
    };
    EvaluationTree.prototype.getBase10Exponent = function (node) {
        if (node == null) {
            return 0;
        }
        else if (node.type == NodeTypes_1.NodeType.Number) {
            return node.number;
        }
        else if (node.type == NodeTypes_1.NodeType.Unit) {
            var unitNode = node;
            var exp = this.getBase10Conversion(unitNode);
            this.convertToBaseUnit(unitNode);
            return exp;
        }
        else {
            var operatorNode = node;
            var leftExponent = this.getBase10Exponent(node.left);
            var rightExponent = this.getBase10Exponent(node.right);
            switch (operatorNode.operator) {
                case '+':
                case '-':
                    if (leftExponent == rightExponent) {
                        return leftExponent;
                    }
                    else {
                        throw new IllegalUnitOperationError_1.IllegalUnitOperationError("Illegal Unit Operation " + operatorNode.operator + " between " + leftExponent + " and " + rightExponent);
                    }
                case '*':
                    return leftExponent + rightExponent;
                case '/':
                    return leftExponent - rightExponent;
                case '^':
                    return leftExponent * rightExponent;
                default:
                    throw new IllegalOperatorError_1.IllegalOperatorError("Illegal Operator of Type " + operatorNode.operator);
            }
        }
    };
    EvaluationTree.prototype.getBase10Conversion = function (node) {
        var unit = node.unit;
        if ((unit == "cycles" || unit == "decays") || UNITS.indexOf(unit) != -1) {
            return 0;
        }
        var base = this.getBaseUnit(unit);
        if (base == "kg") {
            if (node.prefix == "") {
                return -3;
            }
            else {
                return PREFIXES[node.prefix] - 3;
            }
        }
        if (node.prefix != "") {
            return PREFIXES[node.prefix];
        }
        else {
            return 0;
        }
    };
    EvaluationTree.prototype.getPrefix = function (node) {
        if (node.unit == "cycles" || node.unit == "decays") {
            return "";
        }
        if (UNITS.indexOf(node.unit) != -1) {
            return "";
        }
        else {
            var prefix = node.unit[0];
            var base = node.unit.substring(1, node.unit.length);
            if (prefix == "\\") {
                prefix = node.unit.substring(0, 3);
                base = node.unit.substring(3, node.unit.length);
            }
            if (PREFIXES.hasOwnProperty(prefix) && UNITS.indexOf(base) != -1 || base == "g") {
                return prefix;
            }
            else {
                return "";
            }
        }
    };
    EvaluationTree.prototype.convertToBaseUnit = function (node) {
        var base = this.getBaseUnit(node.unit);
        node.unit = base;
    };
    EvaluationTree.prototype.getBaseUnit = function (unit) {
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
    EvaluationTree.prototype.evaluate = function () {
        var value = this.evaluateValue();
        var unit = this.evaluateUnits();
        return "" + value + unit;
    };
    EvaluationTree.prototype.evaluateValue = function () {
        return this.evaluateValueHelper(this.root) * Math.pow(10, this.base10Exp);
    };
    EvaluationTree.prototype.evaluateValueHelper = function (node) {
        if (node == null) {
            return 0;
        }
        else if (node.type == NodeTypes_1.NodeType.Number) {
            var numberNode = node;
            return numberNode.number;
        }
        else if (node.type == NodeTypes_1.NodeType.Variable) {
            var variableNode = node;
            if (this.workspace.hasFormula(variableNode.variable)) {
                var formula = this.workspace.getFormula(variableNode.variable);
                return formula.evaluateValue();
            }
            else {
                throw new UndefinedVariableError_1.UndefinedVariableError("Undefined Variable " + variableNode.variable + " in workspace");
            }
        }
        else if (node.type == NodeTypes_1.NodeType.Invoke) {
            var invokeNode = node;
            var functionName = invokeNode.left.variable;
            var functionParameter = this.evaluateValueHelper(invokeNode.right);
            if (this.workspace.hasFunction(functionName)) {
                var func = this.workspace.getFunction(functionName);
                return func(functionParameter);
            }
            else {
                throw new UndefinedFunctionError_1.UndefinedFunctionError("Undefined Function " + functionName);
            }
        }
        else if (node.type == NodeTypes_1.NodeType.Absolute) {
            return Math.abs(this.evaluateValueHelper(node.right));
        }
        else if (node.type == NodeTypes_1.NodeType.Operator) {
            var operatorNode = node;
            var a = this.evaluateValueHelper(operatorNode.left);
            var b = this.evaluateValueHelper(operatorNode.right);
            switch (operatorNode.operator) {
                case '+':
                    return a + b;
                case '-':
                    return a - b;
                case '*':
                    return a * b;
                case '/':
                    return a / b;
                case '^':
                    return Math.pow(a, b);
                default:
                    throw new IllegalOperatorError_1.IllegalOperatorError("Illegal Operator " + operatorNode.operator);
            }
        }
    };
    EvaluationTree.prototype.evaluateUnits = function () {
        var dimensions = this.evaluateUnitsHelper(this.unitRoot);
        this.removeCanceledUnits(dimensions);
        dimensions = this.simplifyUnits(dimensions);
        dimensions = this.removeDimensionlessUnits(dimensions);
        var unit = this.getDimensionsString(dimensions);
        return unit;
    };
    EvaluationTree.prototype.evaluateUnitsHelper = function (node) {
        if (node == null) {
            return [];
        }
        else if (node.type == NodeTypes_1.NodeType.Unit) {
            var unitNode = node;
            return [new Dimension_1.Dimension(unitNode.unit, unitNode.degree)];
        }
        else if (node.type == NodeTypes_1.NodeType.Number) {
            var degree = node.number;
            return [new Dimension_1.Dimension(null, degree)];
        }
        else if (node.type == NodeTypes_1.NodeType.Variable) {
            return [];
        }
        else if (node.type == NodeTypes_1.NodeType.Operator) {
            var operatorNode = node;
            var leftDimensions = this.evaluateUnitsHelper(node.left);
            var rightDimensions = this.evaluateUnitsHelper(node.right);
            switch (operatorNode.operator) {
                case '+':
                case '-':
                    var leftDimensionsRemoveDimensionless = this.removeDimensionlessUnits(leftDimensions);
                    var rightDimensionsRemoveDimensionless = this.removeDimensionlessUnits(rightDimensions);
                    if (this.isDimensionsEqual(leftDimensionsRemoveDimensionless, rightDimensionsRemoveDimensionless)) {
                        return leftDimensions;
                    }
                    else {
                        throw new IllegalUnitOperationError_1.IllegalUnitOperationError("Illegal Unit Operation of " + operatorNode.operator + " between " + this.getDimensionsString(leftDimensions) + " and " + this.getDimensionsString(rightDimensions));
                    }
                case '/':
                    for (var i = 0; i < rightDimensions.length; i++) {
                        rightDimensions[i].degree *= -1;
                    }
                case '*':
                    for (var i = 0; i < rightDimensions.length; i++) {
                        var leftIndex = this.indexOfDimension(rightDimensions[i], leftDimensions);
                        if (leftIndex == -1) {
                            leftDimensions.push(rightDimensions[i]);
                        }
                        else {
                            leftDimensions[leftIndex].degree += rightDimensions[i].degree;
                        }
                    }
                    return leftDimensions;
                case '^':
                    if (leftDimensions.length == 0 && rightDimensions.length == 0) {
                        return [];
                    }
                    if (rightDimensions.length == 0 && leftDimensions.length != 0) {
                        return leftDimensions;
                    }
                    for (var i = 0; i < leftDimensions.length; i++) {
                        leftDimensions[i].degree = rightDimensions[0].degree;
                    }
                    return leftDimensions;
                default:
                    throw new IllegalOperatorError_1.IllegalOperatorError("Illegal Operator of Type " + operatorNode.operator);
            }
        }
        else {
            throw new IllegalNodeError_1.IllegalNodeError("Node of Type " + node.type + " Cannot Exist in The Unit Tree");
        }
    };
    EvaluationTree.prototype.isDimensionsEqual = function (left, right) {
        if (left.length == 0 || right.length == 0) {
            return true;
        }
        if (left.length != right.length) {
            for (var i = 0; i < left.length; i++) {
                var dimensionRightIndex = this.indexOfDimension(left[i], right);
                if (dimensionRightIndex == -1 && left[i].degree == 0) {
                    return true;
                }
                if (dimensionRightIndex == -1) {
                    return false;
                }
                if (!left[i].equals(right[dimensionRightIndex])) {
                    return false;
                }
            }
        }
        for (var i = 0; i < left.length; i++) {
            var dimensionRightIndex = this.indexOfDimension(left[i], right);
            if (!left[i].equals(right[dimensionRightIndex])) {
                return false;
            }
        }
        return true;
    };
    EvaluationTree.prototype.indexOfDimension = function (dimension, dimensions) {
        for (var i = 0; i < dimensions.length; i++) {
            if (dimension.unit == dimensions[i].unit) {
                return i;
            }
        }
        return -1;
    };
    EvaluationTree.prototype.removeCanceledUnits = function (dimensions) {
        for (var i = dimensions.length - 1; i >= 0; i--) {
            if (dimensions[i].degree == 0) {
                dimensions.splice(i, 1);
            }
        }
    };
    EvaluationTree.prototype.simplifyUnits = function (dimensions) {
        var unitCombinations = this.getAllSimplifications(dimensions);
        if (unitCombinations.length == 0) {
            return dimensions;
        }
        else if (unitCombinations.length == 1) {
            return unitCombinations[0];
        }
        else {
            var smallestCombinations = this.getShortestCombinations(unitCombinations);
            if (smallestCombinations.length == 1) {
                return smallestCombinations[0];
            }
            else {
                return this.getCombinationWithLeastBaseUnits(smallestCombinations);
            }
        }
    };
    EvaluationTree.prototype.getCombinationWithLeastBaseUnits = function (combinations) {
        var bestCombination = [];
        var minBaseUnits = Infinity;
        var count = 0;
        for (var i = 0; i < combinations.length; i++) {
            for (var j = 0; j < combinations[i].length; j++) {
                if (BASE_UNITS.indexOf(combinations[i][j].unit) != -1) {
                    count++;
                }
            }
            minBaseUnits = Math.min(minBaseUnits, count);
            if (count == minBaseUnits) {
                bestCombination = combinations[i];
            }
        }
        return bestCombination;
    };
    EvaluationTree.prototype.getAllSimplifications = function (baseDimensions) {
        var unitCombinations = [];
        this.getAllSimplificationsHelper(baseDimensions, [], unitCombinations);
        unitCombinations = this.combineLikeTerms(unitCombinations);
        unitCombinations = this.removeEquivalentCombinations(unitCombinations);
        return unitCombinations;
    };
    EvaluationTree.prototype.combineLikeTerms = function (combinations) {
        var newCombinations = [];
        for (var i = 0; i < combinations.length; i++) {
            newCombinations.push([]);
            for (var j = 0; j < combinations[i].length; j++) {
                var index = this.indexOfDimension(combinations[i][j], newCombinations[i]);
                if (index == -1) {
                    newCombinations[i].push(combinations[i][j]);
                }
                else {
                    newCombinations[i][index].degree += combinations[i][j].degree;
                }
            }
        }
        return newCombinations;
    };
    EvaluationTree.prototype.removeEquivalentCombinations = function (combinations) {
        var newCombinations = [];
        for (var i = 0; i < combinations.length; i++) {
            var hasCombination = false;
            for (var j = 0; j < newCombinations.length; j++) {
                if (combinations[i].length == newCombinations[j].length) {
                    var isEqual = true;
                    for (var k = 0; k < combinations[i].length; k++) {
                        var index = this.indexOfDimension(combinations[i][k], newCombinations[j]);
                        if (index == -1) {
                            isEqual = false;
                        }
                        else {
                            if (combinations[i][k].degree != newCombinations[j][index].degree) {
                                isEqual = false;
                            }
                        }
                    }
                    if (isEqual) {
                        hasCombination = true;
                    }
                }
            }
            if (!hasCombination) {
                newCombinations.push(combinations[i]);
            }
        }
        return newCombinations;
    };
    EvaluationTree.prototype.getAllSimplificationsHelper = function (baseDimensions, combination, allCombinations) {
        var simplifications = this.getSimplifications(baseDimensions);
        if (Object.keys(simplifications).length == 0) {
            allCombinations.push(this.getFullCombination(combination, baseDimensions));
        }
        else {
            for (var unit in simplifications) {
                var dimensions = this.copyBaseDimensions(baseDimensions);
                var unitDimension = new Dimension_1.Dimension(unit, 1);
                if (this.isOppositeSigns(dimensions, simplifications[unit])) {
                    unitDimension = new Dimension_1.Dimension(unit, -1);
                    for (var i = 0; i < simplifications[unit].length; i++) {
                        simplifications[unit][i].degree = -simplifications[unit][i].degree;
                    }
                }
                this.simplify(dimensions, simplifications[unit]);
                this.removeCanceledUnits(dimensions);
                combination.push(unitDimension);
                this.getAllSimplificationsHelper(dimensions, combination, allCombinations);
                combination.pop();
            }
        }
    };
    EvaluationTree.prototype.getSimplifications = function (dimensions) {
        var possibleSimplifications = {};
        for (var unit in DERIVED_UNITS) {
            if (unit != "Gy" && unit != "Sv" && unit != "dioptry" && unit != "\\deg_C") {
                var SIUnits = this.createDimensionArray(DERIVED_UNITS[unit]);
                if (this.canSimplify(dimensions, SIUnits)) {
                    possibleSimplifications[unit] = SIUnits;
                }
            }
        }
        return possibleSimplifications;
    };
    EvaluationTree.prototype.canSimplify = function (dimensions, SIUnits) {
        for (var i = 0; i < SIUnits.length; i++) {
            var indexOfDimension = this.indexOfDimension(SIUnits[i], dimensions);
            if (indexOfDimension == -1) {
                return false;
            }
        }
        return true;
    };
    EvaluationTree.prototype.getFullCombination = function (combination, dimensions) {
        var dereferencedCombinations = [];
        for (var i = 0; i < combination.length; i++) {
            dereferencedCombinations.push(combination[i]);
        }
        for (var i = 0; i < dimensions.length; i++) {
            dereferencedCombinations.push(dimensions[i]);
        }
        return dereferencedCombinations;
    };
    EvaluationTree.prototype.copyBaseDimensions = function (baseDimensions) {
        var dimensions = [];
        for (var i = 0; i < baseDimensions.length; i++) {
            dimensions[i] = new Dimension_1.Dimension(baseDimensions[i].unit, baseDimensions[i].degree);
        }
        return dimensions;
    };
    EvaluationTree.prototype.isOppositeSigns = function (dimensions, simplificationDimensions) {
        for (var i = 0; i < simplificationDimensions.length; i++) {
            var dimensionIndex = this.indexOfDimension(simplificationDimensions[i], dimensions);
            if ((dimensions[dimensionIndex].degree ^ simplificationDimensions[i].degree) >= 0) {
                return false;
            }
        }
        return true;
    };
    EvaluationTree.prototype.simplify = function (dimensions, simplificationDimensions) {
        for (var i = 0; i < simplificationDimensions.length; i++) {
            var dimensionIndex = this.indexOfDimension(simplificationDimensions[i], dimensions);
            dimensions[dimensionIndex].degree -= simplificationDimensions[i].degree;
        }
    };
    EvaluationTree.prototype.getShortestCombinations = function (combinations) {
        var shortestCombinations = [];
        var minSize = this.getSmallestArraySize(combinations);
        for (var i = 0; i < combinations.length; i++) {
            if (combinations[i].length == minSize) {
                shortestCombinations.push(combinations[i]);
            }
        }
        return shortestCombinations;
    };
    EvaluationTree.prototype.getSmallestArraySize = function (array) {
        var minSize = Infinity;
        for (var i = 0; i < array.length; i++) {
            minSize = Math.min(array[i].length, minSize);
        }
        return minSize;
    };
    EvaluationTree.prototype.removeDimensionlessUnits = function (dimensions) {
        var numerator = [];
        var denominator = [];
        for (var i = 0; i < dimensions.length; i++) {
            if (dimensions[i].degree > 0) {
                numerator.push(dimensions[i]);
            }
            else {
                denominator.push(dimensions[i]);
            }
        }
        if (numerator.length > 1 && this.hasDimensionlessUnits(numerator)) {
            this.removeDimensionlessUnitsFromNumerator(numerator);
        }
        if (this.hasDimensionlessUnits(denominator)) {
            for (var i = denominator.length - 1; i >= 0; i--) {
                var unit = denominator[i].unit;
                if (DIMENSIONLESS_UNITS.indexOf(unit) != -1 && unit != "min" && unit != "hr" && unit != "hp") {
                    denominator.splice(i, 1);
                }
            }
        }
        this.sortUnitsByMagnitude(numerator);
        this.sortUnitsByMagnitude(denominator);
        return numerator.concat(denominator);
    };
    EvaluationTree.prototype.sortUnitsByMagnitude = function (dimensions) {
        dimensions.sort(function (a, b) {
            if (a.degree < b.degree) {
                return -1;
            }
            else if (a.degree == b.degree) {
                return 0;
            }
            else {
                return 1;
            }
        });
    };
    EvaluationTree.prototype.hasDimensionlessUnits = function (dimensions) {
        for (var i = 0; i < dimensions.length; i++) {
            if (DIMENSIONLESS_UNITS.indexOf(dimensions[i].unit) != -1) {
                return true;
            }
        }
        return false;
    };
    EvaluationTree.prototype.removeDimensionlessUnitsFromNumerator = function (dimensions) {
        for (var i = 0; i < dimensions.length; i++) {
            var unit = dimensions[i].unit;
            // min and hr are not removed as they can occur in units such as kWh
            if (DIMENSIONLESS_UNITS.indexOf(unit) != -1 && unit != "min" && unit != "hr" && unit != "hp") {
                dimensions.splice(i, 1);
                return;
            }
        }
    };
    EvaluationTree.prototype.createDimensionArray = function (dimensionString) {
        var units = dimensionString.split('*');
        var dimensions = [];
        for (var i = 0; i < units.length; i++) {
            var parts = units[i].split('^');
            var unit = parts[0].replace(/\s/g, '').substring(1, parts[0].length);
            var degree = parseInt(parts[1]);
            if (isNaN(degree)) {
                degree = 1;
            }
            dimensions.push(new Dimension_1.Dimension(unit, degree));
        }
        return dimensions;
    };
    EvaluationTree.prototype.getDimensionsString = function (dimensions) {
        var dimensionString = "";
        var hasHitNegative = false;
        for (var i = 0; i < dimensions.length; i++) {
            if (hasHitNegative) {
                dimensions[i].degree = -dimensions[i].degree;
            }
            dimensionString += dimensions[i].toString();
            if (i != dimensions.length - 1) {
                if (dimensions[i + 1].degree < 0 && !hasHitNegative) {
                    hasHitNegative = true;
                    dimensionString += "/";
                }
                else {
                    dimensionString += "*";
                }
            }
        }
        return dimensionString;
    };
    return EvaluationTree;
}());
exports.EvaluationTree = EvaluationTree;
