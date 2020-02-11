import * as tslib_1 from "tslib";
import { OfflineContext } from "../../core/context/OfflineContext";
/**
 * Render a segment of the oscillator to an offline context and return the results as an array
 */
export function generateWaveform(instance, length) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var duration, context, clone, buffer;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    duration = length / instance.context.sampleRate;
                    context = new OfflineContext(1, duration, instance.context.sampleRate);
                    clone = new instance.constructor(Object.assign(instance.get(), {
                        // should do 2 iterations
                        frequency: 2 / duration,
                        // zero out the detune
                        detune: 0,
                        context: context
                    })).toDestination();
                    clone.start(0);
                    return [4 /*yield*/, context.render()];
                case 1:
                    buffer = _a.sent();
                    return [2 /*return*/, buffer.getChannelData(0)];
            }
        });
    });
}
//# sourceMappingURL=OscillatorInterface.js.map