import * as tslib_1 from "tslib";
import { Gain } from "../../core/context/Gain";
import { Param } from "../../core/context/Param";
import { connectSeries, ToneAudioNode } from "../../core/context/ToneAudioNode";
import { optionsFromArguments } from "../../core/util/Defaults";
import { readOnly } from "../../core/util/Interface";
import { ToneAudioWorklet } from "../../core/context/ToneAudioWorklet";
/**
 * Comb filters are basic building blocks for physical modeling. Read more
 * about comb filters on [CCRMA's website](https://ccrma.stanford.edu/~jos/pasp/Feedback_Comb_Filters.html).
 *
 * This comb filter is implemented with the AudioWorkletNode which allows it to have feedback delays less than the
 * Web Audio processing block of 128 samples. There is a polyfill for browsers that don't yet support the
 * AudioWorkletNode, but it will add some latency and have slower performance than the AudioWorkletNode.
 * @category Component
 */
var FeedbackCombFilter = /** @class */ (function (_super) {
    tslib_1.__extends(FeedbackCombFilter, _super);
    function FeedbackCombFilter() {
        var _this = _super.call(this, optionsFromArguments(FeedbackCombFilter.getDefaults(), arguments, ["delayTime", "resonance"])) || this;
        _this.name = "FeedbackCombFilter";
        /**
         * Default constructor options for the filter
         */
        _this.workletOptions = {
            numberOfInputs: 1,
            numberOfOutputs: 1,
            channelCount: 1,
        };
        var options = optionsFromArguments(FeedbackCombFilter.getDefaults(), arguments, ["delayTime", "resonance"]);
        _this.input = new Gain({ context: _this.context });
        _this.output = new Gain({ context: _this.context });
        var dummyGain = _this.context.createGain();
        _this.delayTime = new Param({
            context: _this.context,
            value: options.delayTime,
            units: "time",
            minValue: 0,
            maxValue: 1,
            param: dummyGain.gain,
            swappable: true,
        });
        _this.resonance = new Param({
            context: _this.context,
            value: options.resonance,
            units: "normalRange",
            param: dummyGain.gain,
            swappable: true,
        });
        readOnly(_this, ["resonance", "delayTime"]);
        return _this;
    }
    FeedbackCombFilter.prototype._audioWorkletName = function () {
        return "feedback-comb-filter";
    };
    FeedbackCombFilter.prototype._audioWorklet = function () {
        return /* javascript */ " \n\t\t\tregisterProcessor(\"" + this._audioWorkletName() + "\", class extends AudioWorkletProcessor {\n\t\t\t\tstatic get parameterDescriptors() {\n\t\t\t\t\treturn [{\n\t\t\t\t\t\tname: \"delayTime\",\n\t\t\t\t\t\tdefaultValue: 0.1,\n\t\t\t\t\t\tminValue: 0,\n\t\t\t\t\t\tmaxValue: 1,\n\t\t\t\t\t},\n\t\t\t\t\t{\n\t\t\t\t\t\tname: \"feedback\",\n\t\t\t\t\t\tdefaultValue: 0.5,\n\t\t\t\t\t\tminValue: 0,\n\t\t\t\t\t\tmaxValue: 0.9999,\n\t\t\t\t\t}];\n\t\t\t\t}\n\t\t\t\n\t\t\t\tconstructor(options) {\n\t\t\t\t\tsuper(options);\n\t\t\t\t\tthis.delayBuffer = new Float32Array(sampleRate);\n\t\t\t\t}\n\t\t\t\n\t\t\t\tgetParameter(parameter, index) {\n\t\t\t\t\tif (parameter.length > 1) {\n\t\t\t\t\t\treturn parameter[index];\n\t\t\t\t\t} else {\n\t\t\t\t\t\treturn parameter[0];\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\n\t\t\t\tprocess(inputs, outputs, parameters) {\n\t\t\t\t\tconst input = inputs[0];\n\t\t\t\t\tconst output = outputs[0];\n\t\t\t\t\tconst delayLength = this.delayBuffer.length;\n\t\t\t\t\tconst inputChannel = input[0];\n\t\t\t\t\tconst outputChannel = output[0];\n\t\t\t\t\tconst delayTimeParam = parameters.delayTime;\n\t\t\t\t\tconst feedbackParam = parameters.feedback;\n\t\t\t\t\tinputChannel.forEach((value, index) => {\n\t\t\t\t\t\tconst delayTime = this.getParameter(delayTimeParam, index);\n\t\t\t\t\t\tconst feedback = this.getParameter(feedbackParam, index);\n\t\t\t\t\t\tconst delaySamples = Math.floor(delayTime * sampleRate);\n\t\t\t\t\t\tconst currentIndex = (currentFrame + index) % delayLength;\n\t\t\t\t\t\tconst delayedIndex = (currentFrame + index + delaySamples) % delayLength;\n\t\t\t\t\t\t\n\t\t\t\t\t\t// the current value to output\n\t\t\t\t\t\tconst currentValue = this.delayBuffer[currentIndex];\n\t\t\t\t\t\t\n\t\t\t\t\t\t// write the current value to the delayBuffer in the future\n\t\t\t\t\t\tthis.delayBuffer[delayedIndex] = value + currentValue * feedback;\n\n\t\t\t\t\t\t// set all of the output channels to the same value\n\t\t\t\t\t\toutputChannel[index] = delaySamples > 0 ? currentValue : value;\n\t\t\t\t\t});\n\t\t\t\t\t// keep the processing alive\n\t\t\t\t\treturn true;\n\t\t\t\t}\n\t\t\t});\n\t\t";
    };
    /**
     * The default parameters
     */
    FeedbackCombFilter.getDefaults = function () {
        return Object.assign(ToneAudioNode.getDefaults(), {
            delayTime: 0.1,
            resonance: 0.5,
        });
    };
    FeedbackCombFilter.prototype.onReady = function (node) {
        connectSeries(this.input, node, this.output);
        // @ts-ignore
        var delayTime = node.parameters.get("delayTime");
        this.delayTime.setParam(delayTime);
        // @ts-ignore
        var feedback = node.parameters.get("feedback");
        this.resonance.setParam(feedback);
    };
    FeedbackCombFilter.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this.input.dispose();
        this.output.dispose();
        this.delayTime.dispose();
        this.resonance.dispose();
        return this;
    };
    return FeedbackCombFilter;
}(ToneAudioWorklet));
export { FeedbackCombFilter };
//# sourceMappingURL=FeedbackCombFilter.js.map