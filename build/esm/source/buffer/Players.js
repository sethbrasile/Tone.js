import * as tslib_1 from "tslib";
import { Volume } from "../../component/channel/Volume";
import { ToneAudioBuffers } from "../../core/context/ToneAudioBuffers";
import { ToneAudioNode } from "../../core/context/ToneAudioNode";
import { optionsFromArguments } from "../../core/util/Defaults";
import { assert } from "../../core/util/Debug";
import { noOp, readOnly } from "../../core/util/Interface";
import { Source } from "../Source";
import { Player } from "./Player";
/**
 * Players combines multiple [[Player]] objects.
 * @category Source
 */
var Players = /** @class */ (function (_super) {
    tslib_1.__extends(Players, _super);
    function Players() {
        var _this = _super.call(this, optionsFromArguments(Players.getDefaults(), arguments, ["urls", "onload"], "urls")) || this;
        _this.name = "Players";
        /**
         * Players has no input.
         */
        _this.input = undefined;
        /**
         * The container of all of the players
         */
        _this._players = new Map();
        var options = optionsFromArguments(Players.getDefaults(), arguments, ["urls", "onload"], "urls");
        /**
         * The output volume node
         */
        _this._volume = _this.output = new Volume({
            context: _this.context,
            volume: options.volume,
        });
        _this.volume = _this._volume.volume;
        readOnly(_this, "volume");
        _this._buffers = new ToneAudioBuffers({
            urls: options.urls,
            onload: options.onload,
            baseUrl: options.baseUrl,
            onerror: options.onerror
        });
        // mute initially
        _this.mute = options.mute;
        _this._fadeIn = options.fadeIn;
        _this._fadeOut = options.fadeOut;
        return _this;
    }
    Players.getDefaults = function () {
        return Object.assign(Source.getDefaults(), {
            baseUrl: "",
            fadeIn: 0,
            fadeOut: 0,
            mute: false,
            onload: noOp,
            onerror: noOp,
            urls: {},
            volume: 0,
        });
    };
    Object.defineProperty(Players.prototype, "mute", {
        /**
         * Mute the output.
         */
        get: function () {
            return this._volume.mute;
        },
        set: function (mute) {
            this._volume.mute = mute;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Players.prototype, "fadeIn", {
        /**
         * The fadeIn time of the envelope applied to the source.
         */
        get: function () {
            return this._fadeIn;
        },
        set: function (fadeIn) {
            this._fadeIn = fadeIn;
            this._players.forEach(function (player) {
                player.fadeIn = fadeIn;
            });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Players.prototype, "fadeOut", {
        /**
         * The fadeOut time of the each of the sources.
         */
        get: function () {
            return this._fadeOut;
        },
        set: function (fadeOut) {
            this._fadeOut = fadeOut;
            this._players.forEach(function (player) {
                player.fadeOut = fadeOut;
            });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Players.prototype, "state", {
        /**
         * The state of the players object. Returns "started" if any of the players are playing.
         */
        get: function () {
            var playing = Array.from(this._players).some(function (_a) {
                var _b = tslib_1.__read(_a, 2), _ = _b[0], player = _b[1];
                return player.state === "started";
            });
            return playing ? "started" : "stopped";
        },
        enumerable: true,
        configurable: true
    });
    /**
     * True if the buffers object has a buffer by that name.
     * @param name  The key or index of the buffer.
     */
    Players.prototype.has = function (name) {
        return this._buffers.has(name);
    };
    /**
     * Get a player by name.
     * @param  name  The players name as defined in the constructor object or `add` method.
     */
    Players.prototype.player = function (name) {
        assert(this.has(name), "No Player with the name " + name + " exists on this object");
        if (!this._players.has(name)) {
            var player = new Player({
                context: this.context,
                fadeIn: this._fadeIn,
                fadeOut: this._fadeOut,
                url: this._buffers.get(name),
            }).connect(this.output);
            this._players.set(name, player);
        }
        return this._players.get(name);
    };
    Object.defineProperty(Players.prototype, "loaded", {
        /**
         * If all the buffers are loaded or not
         */
        get: function () {
            return this._buffers.loaded;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Add a player by name and url to the Players
     * @param  name A unique name to give the player
     * @param  url  Either the url of the bufer or a buffer which will be added with the given name.
     * @param callback  The callback to invoke when the url is loaded.
     */
    Players.prototype.add = function (name, url, callback) {
        assert(!this._buffers.has(name), "A buffer with that name already exists on this object");
        this._buffers.add(name, url, callback);
        return this;
    };
    /**
     * Stop all of the players at the given time
     * @param time The time to stop all of the players.
     */
    Players.prototype.stopAll = function (time) {
        this._players.forEach(function (player) { return player.stop(time); });
        return this;
    };
    Players.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._volume.dispose();
        this.volume.dispose();
        this._players.forEach(function (player) { return player.dispose(); });
        this._buffers.dispose();
        return this;
    };
    return Players;
}(ToneAudioNode));
export { Players };
//# sourceMappingURL=Players.js.map