import * as tslib_1 from "tslib";
import { ToneAudioBuffers } from "../core/context/ToneAudioBuffers";
import { intervalToFrequencyRatio } from "../core/type/Conversions";
import { FrequencyClass } from "../core/type/Frequency";
import { optionsFromArguments } from "../core/util/Defaults";
import { noOp } from "../core/util/Interface";
import { isArray, isNote, isNumber } from "../core/util/TypeCheck";
import { Instrument } from "../instrument/Instrument";
import { ToneBufferSource } from "../source/buffer/ToneBufferSource";
import { timeRange } from "../core/util/Decorator";
import { assert } from "../core/util/Debug";
/**
 * Pass in an object which maps the note's pitch or midi value to the url,
 * then you can trigger the attack and release of that note like other instruments.
 * By automatically repitching the samples, it is possible to play pitches which
 * were not explicitly included which can save loading time.
 *
 * For sample or buffer playback where repitching is not necessary,
 * use [[Player]].
 * @example
 * import { Sampler } from "tone";
 * const sampler = new Sampler({
 * 	urls: {
 * 		C1: "C1.mp3",
 * 		C2: "C2.mp3",
 * 	},
 * 	baseUrl: "https://tonejs.github.io/examples/audio/casio/",
 * 	onload: () => {
 * 		sampler.triggerAttackRelease(["C1", "E1", "G1", "B1"], 0.5);
 * 	},
 * });
 * @category Instrument
 */
var Sampler = /** @class */ (function (_super) {
    tslib_1.__extends(Sampler, _super);
    function Sampler() {
        var _this = _super.call(this, optionsFromArguments(Sampler.getDefaults(), arguments, ["urls", "onload", "baseUrl"], "urls")) || this;
        _this.name = "Sampler";
        /**
         * The object of all currently playing BufferSources
         */
        _this._activeSources = new Map();
        var options = optionsFromArguments(Sampler.getDefaults(), arguments, ["urls", "onload", "baseUrl"], "urls");
        var urlMap = {};
        Object.keys(options.urls).forEach(function (note) {
            var noteNumber = parseInt(note, 10);
            assert(isNote(note)
                || (isNumber(noteNumber) && isFinite(noteNumber)), "url key is neither a note or midi pitch: " + note);
            if (isNote(note)) {
                // convert the note name to MIDI
                var mid = new FrequencyClass(_this.context, note).toMidi();
                urlMap[mid] = options.urls[note];
            }
            else if (isNumber(noteNumber) && isFinite(noteNumber)) {
                // otherwise if it's numbers assume it's midi
                urlMap[noteNumber] = options.urls[noteNumber];
            }
        });
        _this._buffers = new ToneAudioBuffers({
            urls: urlMap,
            onload: options.onload,
            baseUrl: options.baseUrl,
            onerror: options.onerror,
        });
        _this.attack = options.attack;
        _this.release = options.release;
        _this.curve = options.curve;
        // invoke the callback if it's already loaded
        if (_this._buffers.loaded) {
            // invoke onload deferred
            Promise.resolve().then(options.onload);
        }
        return _this;
    }
    Sampler.getDefaults = function () {
        return Object.assign(Instrument.getDefaults(), {
            attack: 0,
            baseUrl: "",
            curve: "exponential",
            onload: noOp,
            onerror: noOp,
            release: 0.1,
            urls: {},
        });
    };
    /**
     * Returns the difference in steps between the given midi note at the closets sample.
     */
    Sampler.prototype._findClosest = function (midi) {
        // searches within 8 octaves of the given midi note
        var MAX_INTERVAL = 96;
        var interval = 0;
        while (interval < MAX_INTERVAL) {
            // check above and below
            if (this._buffers.has(midi + interval)) {
                return -interval;
            }
            else if (this._buffers.has(midi - interval)) {
                return interval;
            }
            interval++;
        }
        throw new Error("No available buffers for note: " + midi);
    };
    /**
     * @param  notes	The note to play, or an array of notes.
     * @param  time     When to play the note
     * @param  velocity The velocity to play the sample back.
     */
    Sampler.prototype.triggerAttack = function (notes, time, velocity) {
        var _this = this;
        if (velocity === void 0) { velocity = 1; }
        this.log("triggerAttack", notes, time, velocity);
        if (!Array.isArray(notes)) {
            notes = [notes];
        }
        notes.forEach(function (note) {
            var midi = new FrequencyClass(_this.context, note).toMidi();
            // find the closest note pitch
            var difference = _this._findClosest(midi);
            var closestNote = midi - difference;
            var buffer = _this._buffers.get(closestNote);
            var playbackRate = intervalToFrequencyRatio(difference);
            // play that note
            var source = new ToneBufferSource({
                url: buffer,
                context: _this.context,
                curve: _this.curve,
                fadeIn: _this.attack,
                fadeOut: _this.release,
                playbackRate: playbackRate,
            }).connect(_this.output);
            source.start(time, 0, buffer.duration / playbackRate, velocity);
            // add it to the active sources
            if (!isArray(_this._activeSources.get(midi))) {
                _this._activeSources.set(midi, []);
            }
            _this._activeSources.get(midi).push(source);
            // remove it when it's done
            source.onended = function () {
                if (_this._activeSources && _this._activeSources.has(midi)) {
                    var sources = _this._activeSources.get(midi);
                    var index = sources.indexOf(source);
                    if (index !== -1) {
                        sources.splice(index, 1);
                    }
                }
            };
        });
        return this;
    };
    /**
     * @param  notes	The note to release, or an array of notes.
     * @param  time     	When to release the note.
     */
    Sampler.prototype.triggerRelease = function (notes, time) {
        var _this = this;
        this.log("triggerRelease", notes, time);
        if (!Array.isArray(notes)) {
            notes = [notes];
        }
        notes.forEach(function (note) {
            var midi = new FrequencyClass(_this.context, note).toMidi();
            // find the note
            if (_this._activeSources.has(midi) && _this._activeSources.get(midi).length) {
                var sources = _this._activeSources.get(midi);
                time = _this.toSeconds(time);
                sources.forEach(function (source) {
                    source.stop(time);
                });
                _this._activeSources.set(midi, []);
            }
        });
        return this;
    };
    /**
     * Release all currently active notes.
     * @param  time     	When to release the notes.
     */
    Sampler.prototype.releaseAll = function (time) {
        var computedTime = this.toSeconds(time);
        this._activeSources.forEach(function (sources) {
            while (sources.length) {
                var source = sources.shift();
                source.stop(computedTime);
            }
        });
        return this;
    };
    Sampler.prototype.sync = function () {
        this._syncMethod("triggerAttack", 1);
        this._syncMethod("triggerRelease", 1);
        return this;
    };
    /**
     * Invoke the attack phase, then after the duration, invoke the release.
     * @param  notes	The note to play and release, or an array of notes.
     * @param  duration The time the note should be held
     * @param  time     When to start the attack
     * @param  velocity The velocity of the attack
     */
    Sampler.prototype.triggerAttackRelease = function (notes, duration, time, velocity) {
        var _this = this;
        if (velocity === void 0) { velocity = 1; }
        var computedTime = this.toSeconds(time);
        this.triggerAttack(notes, computedTime, velocity);
        if (isArray(duration)) {
            assert(isArray(notes), "notes must be an array when duration is array");
            notes.forEach(function (note, index) {
                var d = duration[Math.min(index, duration.length - 1)];
                _this.triggerRelease(note, computedTime + _this.toSeconds(d));
            });
        }
        else {
            this.triggerRelease(notes, computedTime + this.toSeconds(duration));
        }
        return this;
    };
    /**
     * Add a note to the sampler.
     * @param  note      The buffer's pitch.
     * @param  url  Either the url of the buffer, or a buffer which will be added with the given name.
     * @param  callback  The callback to invoke when the url is loaded.
     */
    Sampler.prototype.add = function (note, url, callback) {
        assert(isNote(note) || isFinite(note), "note must be a pitch or midi: " + note);
        if (isNote(note)) {
            // convert the note name to MIDI
            var mid = new FrequencyClass(this.context, note).toMidi();
            this._buffers.add(mid, url, callback);
        }
        else {
            // otherwise if it's numbers assume it's midi
            this._buffers.add(note, url, callback);
        }
        return this;
    };
    Object.defineProperty(Sampler.prototype, "loaded", {
        /**
         * If the buffers are loaded or not
         */
        get: function () {
            return this._buffers.loaded;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Clean up
     */
    Sampler.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._buffers.dispose();
        this._activeSources.forEach(function (sources) {
            sources.forEach(function (source) { return source.dispose(); });
        });
        this._activeSources.clear();
        return this;
    };
    tslib_1.__decorate([
        timeRange(0)
    ], Sampler.prototype, "attack", void 0);
    tslib_1.__decorate([
        timeRange(0)
    ], Sampler.prototype, "release", void 0);
    return Sampler;
}(Instrument));
export { Sampler };
//# sourceMappingURL=Sampler.js.map