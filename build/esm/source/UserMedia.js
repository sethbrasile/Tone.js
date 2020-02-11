import * as tslib_1 from "tslib";
import { connect, ToneAudioNode } from "../core/context/ToneAudioNode";
import { Volume } from "../component/channel/Volume";
import { optionsFromArguments } from "../core/util/Defaults";
import { assert } from "../core/util/Debug";
import { readOnly } from "../core/util/Interface";
import { isDefined, isNumber } from "../core/util/TypeCheck";
/**
 * UserMedia uses MediaDevices.getUserMedia to open up and external microphone or audio input.
 * Check [MediaDevices API Support](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
 * to see which browsers are supported. Access to an external input
 * is limited to secure (HTTPS) connections.
 * @example
 * import { UserMedia } from "tone";
 * const mic = new UserMedia();
 * mic.open().then(() => {
 * 	// promise resolves when input is available
 * });
 * @category Source
 */
var UserMedia = /** @class */ (function (_super) {
    tslib_1.__extends(UserMedia, _super);
    function UserMedia() {
        var _this = _super.call(this, optionsFromArguments(UserMedia.getDefaults(), arguments, ["volume"])) || this;
        _this.name = "UserMedia";
        var options = optionsFromArguments(UserMedia.getDefaults(), arguments, ["volume"]);
        _this._volume = _this.output = new Volume({
            context: _this.context,
            volume: options.volume,
        });
        _this.volume = _this._volume.volume;
        readOnly(_this, "volume");
        _this.mute = options.mute;
        return _this;
    }
    UserMedia.getDefaults = function () {
        return Object.assign(ToneAudioNode.getDefaults(), {
            mute: false,
            volume: 0
        });
    };
    /**
     * Open the media stream. If a string is passed in, it is assumed
     * to be the label or id of the stream, if a number is passed in,
     * it is the input number of the stream.
     * @param  labelOrId The label or id of the audio input media device.
     *                   With no argument, the default stream is opened.
     * @return The promise is resolved when the stream is open.
     */
    UserMedia.prototype.open = function (labelOrId) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var devices, constraints, stream, mediaStreamNode;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        assert(UserMedia.supported, "UserMedia is not supported");
                        // close the previous stream
                        if (this.state === "started") {
                            this.close();
                        }
                        return [4 /*yield*/, UserMedia.enumerateDevices()];
                    case 1:
                        devices = _a.sent();
                        if (isNumber(labelOrId)) {
                            this._device = devices[labelOrId];
                        }
                        else {
                            this._device = devices.find(function (device) {
                                return device.label === labelOrId || device.deviceId === labelOrId;
                            });
                            // didn't find a matching device
                            if (!this._device && devices.length > 0) {
                                this._device = devices[0];
                            }
                            assert(isDefined(this._device), "No matching device " + labelOrId);
                        }
                        constraints = {
                            audio: {
                                echoCancellation: false,
                                sampleRate: this.context.sampleRate,
                                noiseSuppression: false,
                                mozNoiseSuppression: false,
                            }
                        };
                        if (this._device) {
                            // @ts-ignore
                            constraints.audio.deviceId = this._device.deviceId;
                        }
                        return [4 /*yield*/, navigator.mediaDevices.getUserMedia(constraints)];
                    case 2:
                        stream = _a.sent();
                        // start a new source only if the previous one is closed
                        if (!this._stream) {
                            this._stream = stream;
                            mediaStreamNode = this.context.createMediaStreamSource(stream);
                            // Connect the MediaStreamSourceNode to a gate gain node
                            connect(mediaStreamNode, this.output);
                            this._mediaStream = mediaStreamNode;
                        }
                        return [2 /*return*/, this];
                }
            });
        });
    };
    /**
     * Close the media stream
     */
    UserMedia.prototype.close = function () {
        if (this._stream && this._mediaStream) {
            this._stream.getAudioTracks().forEach(function (track) {
                track.stop();
            });
            this._stream = undefined;
            // remove the old media stream
            this._mediaStream.disconnect();
            this._mediaStream = undefined;
        }
        this._device = undefined;
        return this;
    };
    /**
     * Returns a promise which resolves with the list of audio input devices available.
     * @return The promise that is resolved with the devices
     * @example
     * import { UserMedia } from "tone";
     * UserMedia.enumerateDevices().then((devices) => {
     * 	// print the device labels
     * 	console.log(devices.map(device => device.label));
     * });
     */
    UserMedia.enumerateDevices = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var allDevices;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, navigator.mediaDevices.enumerateDevices()];
                    case 1:
                        allDevices = _a.sent();
                        return [2 /*return*/, allDevices.filter(function (device) {
                                return device.kind === "audioinput";
                            })];
                }
            });
        });
    };
    Object.defineProperty(UserMedia.prototype, "state", {
        /**
         * Returns the playback state of the source, "started" when the microphone is open
         * and "stopped" when the mic is closed.
         */
        get: function () {
            return this._stream && this._stream.active ? "started" : "stopped";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UserMedia.prototype, "deviceId", {
        /**
         * Returns an identifier for the represented device that is
         * persisted across sessions. It is un-guessable by other applications and
         * unique to the origin of the calling application. It is reset when the
         * user clears cookies (for Private Browsing, a different identifier is
         * used that is not persisted across sessions). Returns undefined when the
         * device is not open.
         */
        get: function () {
            if (this._device) {
                return this._device.deviceId;
            }
            else {
                return undefined;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UserMedia.prototype, "groupId", {
        /**
         * Returns a group identifier. Two devices have the
         * same group identifier if they belong to the same physical device.
         * Returns null  when the device is not open.
         */
        get: function () {
            if (this._device) {
                return this._device.groupId;
            }
            else {
                return undefined;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UserMedia.prototype, "label", {
        /**
         * Returns a label describing this device (for example "Built-in Microphone").
         * Returns undefined when the device is not open or label is not available
         * because of permissions.
         */
        get: function () {
            if (this._device) {
                return this._device.label;
            }
            else {
                return undefined;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UserMedia.prototype, "mute", {
        /**
         * Mute the output.
         * @example
         * import { UserMedia } from "tone";
         * const mic = new UserMedia();
         * mic.open().then(() => {
         * 	// promise resolves when input is available
         * });
         * // mute the output
         * mic.mute = true;
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
    UserMedia.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this.close();
        this._volume.dispose();
        this.volume.dispose();
        return this;
    };
    Object.defineProperty(UserMedia, "supported", {
        /**
         * If getUserMedia is supported by the browser.
         */
        get: function () {
            return isDefined(navigator.mediaDevices) &&
                isDefined(navigator.mediaDevices.getUserMedia);
        },
        enumerable: true,
        configurable: true
    });
    return UserMedia;
}(ToneAudioNode));
export { UserMedia };
//# sourceMappingURL=UserMedia.js.map