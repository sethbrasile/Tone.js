import * as tslib_1 from "tslib";
import { getContext, setContext } from "../Global";
import { OfflineContext } from "./OfflineContext";
import { ToneAudioBuffer } from "./ToneAudioBuffer";
/**
 * Generate a buffer by rendering all of the Tone.js code within the callback using the OfflineAudioContext.
 * The OfflineAudioContext is capable of rendering much faster than real time in many cases.
 * The callback function also passes in an offline instance of [[Context]] which can be used
 * to schedule events along the Transport.
 * @param  callback  All Tone.js nodes which are created and scheduled within this callback are recorded into the output Buffer.
 * @param  duration     the amount of time to record for.
 * @return  The promise which is invoked with the ToneAudioBuffer of the recorded output.
 * @example
 * import { Offline, Oscillator } from "tone";
 * // render 2 seconds of the oscillator
 * Offline(() => {
 * 	// only nodes created in this callback will be recorded
 * 	const oscillator = new Oscillator().toDestination().start(0);
 * }, 2).then((buffer) => {
 * 	// do something with the output buffer
 * 	console.log(buffer);
 * });
 * @example
 * import { Offline, Oscillator } from "tone";
 * // can also schedule events along the Transport
 * // using the passed in Offline Transport
 * Offline(({ transport }) => {
 * 	const osc = new Oscillator().toDestination();
 * 	transport.schedule(time => {
 * 		osc.start(time).stop(time + 0.1);
 * 	}, 1);
 * 	// make sure to start the transport
 * 	transport.start(0.2);
 * }, 4).then((buffer) => {
 * 	// do something with the output buffer
 * 	console.log(buffer);
 * });
 * @category Core
 */
export function Offline(callback, duration, channels, sampleRate) {
    if (channels === void 0) { channels = 2; }
    if (sampleRate === void 0) { sampleRate = getContext().sampleRate; }
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var originalContext, context, bufferPromise, buffer;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    originalContext = getContext();
                    context = new OfflineContext(channels, duration, sampleRate);
                    setContext(context);
                    // invoke the callback/scheduling
                    return [4 /*yield*/, callback(context)];
                case 1:
                    // invoke the callback/scheduling
                    _a.sent();
                    bufferPromise = context.render();
                    // return the original AudioContext
                    setContext(originalContext);
                    return [4 /*yield*/, bufferPromise];
                case 2:
                    buffer = _a.sent();
                    // return the audio
                    return [2 /*return*/, new ToneAudioBuffer(buffer)];
            }
        });
    });
}
//# sourceMappingURL=Offline.js.map