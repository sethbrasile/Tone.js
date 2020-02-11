import { Degrees, Frequency, Seconds, Time } from "../../core/type/Units";
import { Signal } from "../../signal/Signal";
import { Source } from "../Source";
import { FMConstructorOptions, FMOscillatorOptions, ToneOscillatorInterface, ToneOscillatorType } from "./OscillatorInterface";
export { FMOscillatorOptions } from "./OscillatorInterface";
/**
 * FMOscillator implements a frequency modulation synthesis
 * ```
 *                                              +-------------+
 * +---------------+        +-------------+     | Carrier Osc |
 * | Modulator Osc +>-------> GainNode    |     |             +--->Output
 * +---------------+        |             +>----> frequency   |
 *                       +--> gain        |     +-------------+
 *                       |  +-------------+
 * +-----------------+   |
 * | modulationIndex +>--+
 * +-----------------+
 * ```
 *
 * @example
 * import { FMOscillator } from "tone";
 * // a sine oscillator frequency-modulated by a square wave
 * const fmOsc = new FMOscillator("Ab3", "sine", "square").toDestination().start();
 * @category Source
 */
export declare class FMOscillator extends Source<FMOscillatorOptions> implements ToneOscillatorInterface {
    readonly name: string;
    /**
     * The carrier oscillator
     */
    private _carrier;
    readonly frequency: Signal<"frequency">;
    readonly detune: Signal<"cents">;
    /**
     * The modulating oscillator
     */
    private _modulator;
    /**
     * Harmonicity is the frequency ratio between the carrier and the modulator oscillators.
     * A harmonicity of 1 gives both oscillators the same frequency.
     * Harmonicity = 2 means a change of an octave.
     * @example
     * import { FMOscillator } from "tone";
     * const fmOsc = new FMOscillator("D2").toDestination().start();
     * // pitch the modulator an octave below carrier
     * fmOsc.harmonicity.value = 0.5;
     */
    readonly harmonicity: Signal<"positive">;
    /**
     * The modulation index which is in essence the depth or amount of the modulation. In other terms it is the
     * ratio of the frequency of the modulating signal (mf) to the amplitude of the
     * modulating signal (ma) -- as in ma/mf.
     */
    readonly modulationIndex: Signal<"positive">;
    /**
     * the node where the modulation happens
     */
    private _modulationNode;
    /**
     * @param frequency The starting frequency of the oscillator.
     * @param type The type of the carrier oscillator.
     * @param modulationType The type of the modulator oscillator.
     */
    constructor(frequency?: Frequency, type?: ToneOscillatorType, modulationType?: ToneOscillatorType);
    constructor(options?: Partial<FMConstructorOptions>);
    static getDefaults(): FMOscillatorOptions;
    /**
     * start the oscillator
     */
    protected _start(time: Time): void;
    /**
     * stop the oscillator
     */
    protected _stop(time: Time): void;
    protected _restart(time: Seconds): this;
    type: ToneOscillatorType;
    baseType: OscillatorType;
    partialCount: number;
    /**
     * The type of the modulator oscillator
     */
    modulationType: ToneOscillatorType;
    phase: Degrees;
    partials: number[];
    asArray(length?: number): Promise<Float32Array>;
    /**
     * Clean up.
     */
    dispose(): this;
}
