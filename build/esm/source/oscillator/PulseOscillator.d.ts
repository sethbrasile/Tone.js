import { AudioRange, Degrees, Frequency, Seconds, Time } from "../../core/type/Units";
import { Signal } from "../../signal/Signal";
import { Source } from "../Source";
import { PulseOscillatorOptions, ToneOscillatorInterface } from "./OscillatorInterface";
export { PulseOscillatorOptions } from "./OscillatorInterface";
/**
 * PulseOscillator is an oscillator with control over pulse width,
 * also known as the duty cycle. At 50% duty cycle (width = 0) the wave is
 * a square wave.
 * [Read more](https://wigglewave.wordpress.com/2014/08/16/pulse-waveforms-and-harmonics/).
 * ```
 *    width = -0.25        width = 0.0          width = 0.25
 *
 *   +-----+            +-------+       +    +-------+     +-+
 *   |     |            |       |       |            |     |
 *   |     |            |       |       |            |     |
 * +-+     +-------+    +       +-------+            +-----+
 *
 *
 *    width = -0.5                              width = 0.5
 *
 *     +---+                                 +-------+   +---+
 *     |   |                                         |   |
 *     |   |                                         |   |
 * +---+   +-------+                                 +---+
 *
 *
 *    width = -0.75                             width = 0.75
 *
 *       +-+                                 +-------+ +-----+
 *       | |                                         | |
 *       | |                                         | |
 * +-----+ +-------+                                 +-+
 * ```
 * @example
 * import { PulseOscillator } from "tone";
 * const pulse = new PulseOscillator("E5", 0.4).toDestination().start();
 * @category Source
 */
export declare class PulseOscillator extends Source<PulseOscillatorOptions> implements ToneOscillatorInterface {
    readonly name: string;
    /**
     * The width of the pulse.
     */
    width: Signal<"audioRange">;
    /**
     * gate the width amount
     */
    private _widthGate;
    /**
     * the sawtooth oscillator
     */
    private _sawtooth;
    /**
     * The frequency control.
     */
    frequency: Signal<"frequency">;
    /**
     * The detune in cents.
     */
    detune: Signal<"cents">;
    /**
     * Threshold the signal to turn it into a square
     */
    private _thresh;
    /**
     * @param frequency The frequency of the oscillator
     * @param width The width of the pulse
     */
    constructor(frequency?: Frequency, width?: AudioRange);
    constructor(options?: Partial<PulseOscillatorOptions>);
    static getDefaults(): PulseOscillatorOptions;
    /**
     * start the oscillator
     */
    protected _start(time: Time): void;
    /**
     * stop the oscillator
     */
    protected _stop(time: Time): void;
    protected _restart(time: Seconds): void;
    /**
     * The phase of the oscillator in degrees.
     */
    phase: Degrees;
    /**
     * The type of the oscillator. Always returns "pulse".
     */
    readonly type: "pulse";
    /**
     * The baseType of the oscillator. Always returns "pulse".
     */
    readonly baseType: "pulse";
    /**
     * The partials of the waveform. Cannot set partials for this waveform type
     */
    readonly partials: number[];
    /**
     * No partials for this waveform type.
     */
    readonly partialCount: number;
    asArray(length?: number): Promise<Float32Array>;
    /**
     * Clean up method.
     */
    dispose(): this;
}
