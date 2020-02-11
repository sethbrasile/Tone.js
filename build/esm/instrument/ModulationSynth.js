import * as tslib_1 from "tslib";
import { Signal } from "../signal/Signal";
import { Multiply } from "../signal/Multiply";
import { Gain } from "../core/context/Gain";
import { Envelope } from "../component/envelope/Envelope";
import { ToneAudioNode } from "../core/context/ToneAudioNode";
import { Monophonic } from "./Monophonic";
import { OmniOscillator } from "../source/oscillator/OmniOscillator";
import { Source } from "../source/Source";
import { Synth } from "./Synth";
import { readOnly } from "../core/util/Interface";
import { omitFromObject, optionsFromArguments } from "../core/util/Defaults";
/**
 * Base class for both AM and FM synths
 */
var ModulationSynth = /** @class */ (function (_super) {
    tslib_1.__extends(ModulationSynth, _super);
    function ModulationSynth() {
        var _this = _super.call(this, optionsFromArguments(ModulationSynth.getDefaults(), arguments)) || this;
        _this.name = "ModulationSynth";
        var options = optionsFromArguments(ModulationSynth.getDefaults(), arguments);
        _this._carrier = new Synth({
            context: _this.context,
            oscillator: options.oscillator,
            envelope: options.envelope,
            onsilence: function () { return _this.onsilence(_this); },
            volume: -10,
        });
        _this._modulator = new Synth({
            context: _this.context,
            oscillator: options.modulation,
            envelope: options.modulationEnvelope,
            volume: -10,
        });
        _this.oscillator = _this._carrier.oscillator;
        _this.envelope = _this._carrier.envelope;
        _this.modulation = _this._modulator.oscillator;
        _this.modulationEnvelope = _this._modulator.envelope;
        _this.frequency = new Signal({
            context: _this.context,
            units: "frequency",
        });
        _this.detune = new Signal({
            context: _this.context,
            value: options.detune,
            units: "cents"
        });
        _this.harmonicity = new Multiply({
            context: _this.context,
            value: options.harmonicity,
            minValue: 0,
        });
        _this._modulationNode = new Gain({
            context: _this.context,
            gain: 0,
        });
        readOnly(_this, ["frequency", "harmonicity", "oscillator", "envelope", "modulation", "modulationEnvelope", "detune"]);
        return _this;
    }
    ModulationSynth.getDefaults = function () {
        return Object.assign(Monophonic.getDefaults(), {
            harmonicity: 3,
            oscillator: Object.assign(omitFromObject(OmniOscillator.getDefaults(), tslib_1.__spread(Object.keys(Source.getDefaults()), [
                "frequency",
                "detune"
            ])), {
                type: "sine"
            }),
            envelope: Object.assign(omitFromObject(Envelope.getDefaults(), Object.keys(ToneAudioNode.getDefaults())), {
                attack: 0.01,
                decay: 0.01,
                sustain: 1,
                release: 0.5
            }),
            modulation: Object.assign(omitFromObject(OmniOscillator.getDefaults(), tslib_1.__spread(Object.keys(Source.getDefaults()), [
                "frequency",
                "detune"
            ])), {
                type: "square"
            }),
            modulationEnvelope: Object.assign(omitFromObject(Envelope.getDefaults(), Object.keys(ToneAudioNode.getDefaults())), {
                attack: 0.5,
                decay: 0.0,
                sustain: 1,
                release: 0.5
            })
        });
    };
    /**
     * Trigger the attack portion of the note
     */
    ModulationSynth.prototype._triggerEnvelopeAttack = function (time, velocity) {
        // @ts-ignore
        this._carrier._triggerEnvelopeAttack(time, velocity);
        // @ts-ignore
        this._modulator._triggerEnvelopeAttack(time, velocity);
    };
    /**
     * Trigger the release portion of the note
     */
    ModulationSynth.prototype._triggerEnvelopeRelease = function (time) {
        // @ts-ignore
        this._carrier._triggerEnvelopeRelease(time);
        // @ts-ignore
        this._modulator._triggerEnvelopeRelease(time);
        return this;
    };
    ModulationSynth.prototype.getLevelAtTime = function (time) {
        time = this.toSeconds(time);
        return this.envelope.getValueAtTime(time);
    };
    ModulationSynth.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._carrier.dispose();
        this._modulator.dispose();
        this.frequency.dispose();
        this.detune.dispose();
        this.harmonicity.dispose();
        this._modulationNode.dispose();
        return this;
    };
    return ModulationSynth;
}(Monophonic));
export { ModulationSynth };
//# sourceMappingURL=ModulationSynth.js.map