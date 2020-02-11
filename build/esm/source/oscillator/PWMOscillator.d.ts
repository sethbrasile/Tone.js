import { Degrees, Frequency, Seconds, Time } from "../../core/type/Units";
import { Signal } from "../../signal/Signal";
import { Source } from "../Source";
import { PWMOscillatorOptions, ToneOscillatorInterface } from "./OscillatorInterface";
export { PWMOscillatorOptions } from "./OscillatorInterface";
/**
 * PWMOscillator modulates the width of a Tone.PulseOscillator
 * at the modulationFrequency. This has the effect of continuously
 * changing the timbre of the oscillator by altering the harmonics
 * generated.
 * @example
 * import { PWMOscillator } from "tone";
 * const pwm = new PWMOscillator("Ab3", 0.3).toDestination().start();
 * @category Source
 */
export declare class PWMOscillator extends Source<PWMOscillatorOptions> implements ToneOscillatorInterface {
    readonly name: string;
    readonly sourceType = "pwm";
    /**
     * the pulse oscillator
     */
    private _pulse;
    /**
     * the modulator
     */
    private _modulator;
    /**
     * Scale the oscillator so it doesn't go silent
     * at the extreme values.
     */
    private _scale;
    /**
     * The frequency control.
     */
    readonly frequency: Signal<"frequency">;
    /**
     * The detune of the oscillator.
     */
    readonly detune: Signal<"cents">;
    /**
     * The modulation rate of the oscillator.
     */
    readonly modulationFrequency: Signal<"frequency">;
    /**
     * @param {Frequency} frequency The starting frequency of the oscillator.
     * @param {Frequency} modulationFrequency The modulation frequency of the width of the pulse.
     */
    constructor(frequency?: Frequency, modulationFrequency?: Frequency);
    constructor(options?: Partial<PWMOscillatorOptions>);
    static getDefaults(): PWMOscillatorOptions;
    /**
     * start the oscillator
     */
    protected _start(time: Time): void;
    /**
     * stop the oscillator
     */
    protected _stop(time: Time): void;
    /**
     * restart the oscillator
     */
    protected _restart(time: Seconds): void;
    /**
     * The type of the oscillator. Always returns "pwm".
     */
    readonly type: "pwm";
    /**
     * The baseType of the oscillator. Always returns "pwm".
     */
    readonly baseType: "pwm";
    /**
     * The partials of the waveform. Cannot set partials for this waveform type
     */
    readonly partials: number[];
    /**
     * No partials for this waveform type.
     */
    readonly partialCount: number;
    /**
     * The phase of the oscillator in degrees.
     */
    phase: Degrees;
    asArray(length?: number): Promise<Float32Array>;
    /**
     * Clean up.
     */
    dispose(): this;
}
