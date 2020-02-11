import * as tslib_1 from "tslib";
import { assert } from "../core/util/Debug";
import { clamp } from "../core/util/Math";
/**
 * Start at the first value and go up to the last
 */
function upPatternGen(values) {
    var index;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                index = 0;
                _a.label = 1;
            case 1:
                if (!(index < values.length)) return [3 /*break*/, 3];
                index = clampToArraySize(index, values);
                return [4 /*yield*/, values[index]];
            case 2:
                _a.sent();
                index++;
                return [3 /*break*/, 1];
            case 3: return [2 /*return*/];
        }
    });
}
/**
 * Start at the last value and go down to 0
 */
function downPatternGen(values) {
    var index;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                index = values.length - 1;
                _a.label = 1;
            case 1:
                if (!(index >= 0)) return [3 /*break*/, 3];
                index = clampToArraySize(index, values);
                return [4 /*yield*/, values[index]];
            case 2:
                _a.sent();
                index--;
                return [3 /*break*/, 1];
            case 3: return [2 /*return*/];
        }
    });
}
/**
 * Infinitely yield the generator
 */
function infiniteGen(values, gen) {
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!true) return [3 /*break*/, 2];
                return [5 /*yield**/, tslib_1.__values(gen(values))];
            case 1:
                _a.sent();
                return [3 /*break*/, 0];
            case 2: return [2 /*return*/];
        }
    });
}
/**
 * Make sure that the index is in the given range
 */
function clampToArraySize(index, values) {
    return clamp(index, 0, values.length - 1);
}
/**
 * Alternate between two generators
 */
function alternatingGenerator(values, directionUp) {
    var index;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                index = directionUp ? 0 : values.length - 1;
                _a.label = 1;
            case 1:
                if (!true) return [3 /*break*/, 3];
                index = clampToArraySize(index, values);
                return [4 /*yield*/, values[index]];
            case 2:
                _a.sent();
                if (directionUp) {
                    index++;
                    if (index >= values.length - 1) {
                        directionUp = false;
                    }
                }
                else {
                    index--;
                    if (index <= 0) {
                        directionUp = true;
                    }
                }
                return [3 /*break*/, 1];
            case 3: return [2 /*return*/];
        }
    });
}
/**
 * Starting from the bottom move up 2, down 1
 */
function jumpUp(values) {
    var index, stepIndex;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                index = 0;
                stepIndex = 0;
                _a.label = 1;
            case 1:
                if (!(index < values.length)) return [3 /*break*/, 3];
                index = clampToArraySize(index, values);
                return [4 /*yield*/, values[index]];
            case 2:
                _a.sent();
                stepIndex++;
                index += (stepIndex % 2 ? 2 : -1);
                return [3 /*break*/, 1];
            case 3: return [2 /*return*/];
        }
    });
}
/**
 * Starting from the top move down 2, up 1
 */
function jumpDown(values) {
    var index, stepIndex;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                index = values.length - 1;
                stepIndex = 0;
                _a.label = 1;
            case 1:
                if (!(index >= 0)) return [3 /*break*/, 3];
                index = clampToArraySize(index, values);
                return [4 /*yield*/, values[index]];
            case 2:
                _a.sent();
                stepIndex++;
                index += (stepIndex % 2 ? -2 : 1);
                return [3 /*break*/, 1];
            case 3: return [2 /*return*/];
        }
    });
}
/**
 * Choose a random index each time
 */
function randomGen(values) {
    var randomIndex;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!true) return [3 /*break*/, 2];
                randomIndex = Math.floor(Math.random() * values.length);
                return [4 /*yield*/, values[randomIndex]];
            case 1:
                _a.sent();
                return [3 /*break*/, 0];
            case 2: return [2 /*return*/];
        }
    });
}
/**
 * Randomly go through all of the values once before choosing a new random order
 */
function randomOnce(values) {
    var copy, i, randVal, index;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                copy = [];
                for (i = 0; i < values.length; i++) {
                    copy.push(i);
                }
                _a.label = 1;
            case 1:
                if (!(copy.length > 0)) return [3 /*break*/, 3];
                randVal = copy.splice(Math.floor(copy.length * Math.random()), 1);
                index = clampToArraySize(randVal[0], values);
                return [4 /*yield*/, values[index]];
            case 2:
                _a.sent();
                return [3 /*break*/, 1];
            case 3: return [2 /*return*/];
        }
    });
}
/**
 * PatternGenerator returns a generator which will iterate over the given array
 * of values and yield the items according to the passed in pattern
 * @param values An array of values to iterate over
 * @param pattern The name of the pattern use when iterating over
 * @param index Where to start in the offset of the values array
 */
export function PatternGenerator(values, pattern, index) {
    var _a;
    if (pattern === void 0) { pattern = "up"; }
    if (index === void 0) { index = 0; }
    return tslib_1.__generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                // safeguards
                assert(values.length > 0, "The array must have more than one value in it");
                _a = pattern;
                switch (_a) {
                    case "up": return [3 /*break*/, 1];
                    case "down": return [3 /*break*/, 3];
                    case "upDown": return [3 /*break*/, 5];
                    case "downUp": return [3 /*break*/, 7];
                    case "alternateUp": return [3 /*break*/, 9];
                    case "alternateDown": return [3 /*break*/, 11];
                    case "random": return [3 /*break*/, 13];
                    case "randomOnce": return [3 /*break*/, 15];
                }
                return [3 /*break*/, 17];
            case 1: return [5 /*yield**/, tslib_1.__values(infiniteGen(values, upPatternGen))];
            case 2:
                _b.sent();
                _b.label = 3;
            case 3: return [5 /*yield**/, tslib_1.__values(infiniteGen(values, downPatternGen))];
            case 4:
                _b.sent();
                _b.label = 5;
            case 5: return [5 /*yield**/, tslib_1.__values(alternatingGenerator(values, true))];
            case 6:
                _b.sent();
                _b.label = 7;
            case 7: return [5 /*yield**/, tslib_1.__values(alternatingGenerator(values, false))];
            case 8:
                _b.sent();
                _b.label = 9;
            case 9: return [5 /*yield**/, tslib_1.__values(infiniteGen(values, jumpUp))];
            case 10:
                _b.sent();
                _b.label = 11;
            case 11: return [5 /*yield**/, tslib_1.__values(infiniteGen(values, jumpDown))];
            case 12:
                _b.sent();
                _b.label = 13;
            case 13: return [5 /*yield**/, tslib_1.__values(randomGen(values))];
            case 14:
                _b.sent();
                _b.label = 15;
            case 15: return [5 /*yield**/, tslib_1.__values(infiniteGen(values, randomOnce))];
            case 16:
                _b.sent();
                _b.label = 17;
            case 17: return [2 /*return*/];
        }
    });
}
//# sourceMappingURL=PatternGenerator.js.map