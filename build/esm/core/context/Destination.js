import * as tslib_1 from "tslib";
import { Volume } from "../../component/channel/Volume";
import { optionsFromArguments } from "../util/Defaults";
import { onContextClose, onContextInit } from "./ContextInitialization";
import { Gain } from "./Gain";
import { connectSeries, ToneAudioNode } from "./ToneAudioNode";
/**
 * A single master output which is connected to the
 * AudioDestinationNode (aka your speakers).
 * It provides useful conveniences such as the ability
 * to set the volume and mute the entire application.
 * It also gives you the ability to apply master effects to your application.
 *
 * @example
 * import { Destination, Oscillator } from "tone";
 * const oscillator = new Oscillator().start();
 * // the audio will go from the oscillator to the speakers
 * oscillator.connect(Destination);
 * // a convenience for connecting to the master output is also provided:
 * oscillator.toDestination();
 * // these two are equivalent.
 * @category Core
 */
var Destination = /** @class */ (function (_super) {
    tslib_1.__extends(Destination, _super);
    function Destination() {
        var _this = _super.call(this, optionsFromArguments(Destination.getDefaults(), arguments)) || this;
        _this.name = "Destination";
        _this.input = new Volume({ context: _this.context });
        _this.output = new Gain({ context: _this.context });
        /**
         * The volume of the master output.
         */
        _this.volume = _this.input.volume;
        var options = optionsFromArguments(Destination.getDefaults(), arguments);
        connectSeries(_this.input, _this.output, _this.context.rawContext.destination);
        _this.mute = options.mute;
        return _this;
    }
    Destination.getDefaults = function () {
        return Object.assign(ToneAudioNode.getDefaults(), {
            mute: false,
            volume: 0,
        });
    };
    Object.defineProperty(Destination.prototype, "mute", {
        /**
         * Mute the output.
         * @example
         * import { Destination, Oscillator } from "tone";
         * const oscillator = new Oscillator().start().toDestination();
         * // mute the output
         * Destination.mute = true;
         */
        get: function () {
            return this.input.mute;
        },
        set: function (mute) {
            this.input.mute = mute;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Add a master effects chain. NOTE: this will disconnect any nodes which were previously
     * chained in the master effects chain.
     * @param args All arguments will be connected in a row and the Master will be routed through it.
     * @return  {Destination}  this
     * @example
     * import { Compressor, Destination, Filter } from "tone";
     * // some overall compression to keep the levels in check
     * const masterCompressor = new Compressor({
     * 	threshold: -6,
     * 	ratio: 3,
     * 	attack: 0.5,
     * 	release: 0.1
     * });
     * // give a little boost to the lows
     * const lowBump = new Filter(200, "lowshelf");
     * // route everything through the filter and compressor before going to the speakers
     * Destination.chain(lowBump, masterCompressor);
     */
    Destination.prototype.chain = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.input.disconnect();
        args.unshift(this.input);
        args.push(this.output);
        connectSeries.apply(void 0, tslib_1.__spread(args));
        return this;
    };
    /**
     * Clean up
     */
    Destination.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this.volume.dispose();
        return this;
    };
    return Destination;
}(ToneAudioNode));
export { Destination };
//-------------------------------------
// 	INITIALIZATION
//-------------------------------------
onContextInit(function (context) {
    context.destination = new Destination({ context: context });
});
onContextClose(function (context) {
    context.destination.dispose();
});
//# sourceMappingURL=Destination.js.map