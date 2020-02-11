import * as tslib_1 from "tslib";
import { ToneAudioWorklet } from "../core/context/ToneAudioWorklet";
import { Effect } from "./Effect";
import { Gain } from "../core/context/Gain";
import { optionsFromArguments } from "../core/util/Defaults";
import { connectSeries } from "../core/context/ToneAudioNode";
import { Param } from "../core/context/Param";
/**
 * BitCrusher down-samples the incoming signal to a different bit depth.
 * Lowering the bit depth of the signal creates distortion. Read more about BitCrushing
 * on [Wikipedia](https://en.wikipedia.org/wiki/Bitcrusher).
 * @example
 * import { BitCrusher, Synth } from "tone";
 * // initialize crusher and route a synth through it
 * const crusher = new BitCrusher(4).toDestination();
 * const synth = new Synth().connect(crusher);
 * synth.triggerAttackRelease("C2", 2);
 *
 * @category Effect
 */
var BitCrusher = /** @class */ (function (_super) {
    tslib_1.__extends(BitCrusher, _super);
    function BitCrusher() {
        var _this = _super.call(this, optionsFromArguments(BitCrusher.getDefaults(), arguments, ["bits"])) || this;
        _this.name = "BitCrusher";
        var options = optionsFromArguments(BitCrusher.getDefaults(), arguments, ["bits"]);
        _this._bitCrusherWorklet = new BitCrusherWorklet({
            context: _this.context,
            bits: options.bits,
        });
        // connect it up
        _this.connectEffect(_this._bitCrusherWorklet);
        _this.bits = _this._bitCrusherWorklet.bits;
        return _this;
    }
    BitCrusher.getDefaults = function () {
        return Object.assign(Effect.getDefaults(), {
            bits: 4,
            frequencyReduction: 0.5,
        });
    };
    BitCrusher.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._bitCrusherWorklet.dispose();
        return this;
    };
    return BitCrusher;
}(Effect));
export { BitCrusher };
/**
 * Internal class which creates an AudioWorklet to do the bit crushing
 */
var BitCrusherWorklet = /** @class */ (function (_super) {
    tslib_1.__extends(BitCrusherWorklet, _super);
    function BitCrusherWorklet() {
        var _this = _super.call(this, optionsFromArguments(BitCrusherWorklet.getDefaults(), arguments)) || this;
        _this.name = "BitCrusherWorklet";
        _this.workletOptions = {
            numberOfInputs: 1,
            numberOfOutputs: 1,
        };
        var options = optionsFromArguments(BitCrusherWorklet.getDefaults(), arguments);
        _this.input = new Gain({ context: _this.context });
        _this.output = new Gain({ context: _this.context });
        var dummyGain = _this.context.createGain();
        _this.bits = new Param({
            context: _this.context,
            value: options.bits,
            units: "positive",
            minValue: 1,
            maxValue: 16,
            param: dummyGain.gain,
            swappable: true,
        });
        return _this;
    }
    BitCrusherWorklet.getDefaults = function () {
        return Object.assign(ToneAudioWorklet.getDefaults(), {
            bits: 12,
        });
    };
    BitCrusherWorklet.prototype._audioWorkletName = function () {
        return "bit-crusher";
    };
    BitCrusherWorklet.prototype._audioWorklet = function () {
        return /* javascript */ " \n\t\tregisterProcessor(\"" + this._audioWorkletName() + "\", class extends AudioWorkletProcessor {\n\t\t\tstatic get parameterDescriptors () {\n\t\t\t\treturn [{\n\t\t\t\t\tname: 'bits',\n\t\t\t\t\tdefaultValue: 12,\n\t\t\t\t\tminValue: 1,\n\t\t\t\t\tmaxValue: 16\n\t\t\t\t}];\n\t\t\t}\n\t\t\t\n\t\t\tprocess (inputs, outputs, parameters) {\n\t\t\t\tconst input = inputs[0];\n\t\t\t\tconst output = outputs[0];\n\t\t\t\tif (input && output && input.length === output.length) {\n\t\t\t\t\tconst bits = parameters.bits;\n\t\t\t\t\tfor (let channelNum = 0; channelNum < input.length; channelNum++) {\n\t\t\t\t\t\tconst inputChannel = input[channelNum];\n\t\t\t\t\t\tfor (let index = 0; index < inputChannel.length; index++) {\n\t\t\t\t\t\t\tconst value = inputChannel[index];\n\t\t\t\t\t\t\tconst step = bits.length > 1 ? Math.pow(0.5, bits[index]) : Math.pow(0.5, bits[0]);\n\t\t\t\t\t\t\tconst val = step * Math.floor(value / step + 0.5);\n\t\t\t\t\t\t\toutput[channelNum][index] = val;\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\treturn true;\n\t\t\t}\n\t\t});\n\t\t";
    };
    BitCrusherWorklet.prototype.onReady = function (node) {
        connectSeries(this.input, node, this.output);
        // @ts-ignore
        var bits = node.parameters.get("bits");
        this.bits.setParam(bits);
    };
    BitCrusherWorklet.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this.input.dispose();
        this.output.dispose();
        this.bits.dispose();
        return this;
    };
    return BitCrusherWorklet;
}(ToneAudioWorklet));
//# sourceMappingURL=BitCrusher.js.map