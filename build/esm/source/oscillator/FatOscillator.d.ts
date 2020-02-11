import { Cents, Degrees, Frequency, Seconds, Time } from "../../core/type/Units";
import { Signal } from "../../signal/Signal";
import { Source } from "../Source";
import { FatConstructorOptions, FatOscillatorOptions, ToneOscillatorInterface, ToneOscillatorType } from "./OscillatorInterface";
export { FatOscillatorOptions } from "./OscillatorInterface";
/**
 * FatOscillator is an array of oscillators with detune spread between the oscillators
 * @example
 * import { FatOscillator } from "tone";
 * const fatOsc = new FatOscillator("Ab3", "sawtooth", 40).toDestination().start();
 * @category Source
 */
export declare class FatOscillator extends Source<FatOscillatorOptions> implements ToneOscillatorInterface {
    readonly name: string;
    readonly frequency: Signal<"frequency">;
    readonly detune: Signal<"cents">;
    /**
     * The array of oscillators
     */
    private _oscillators;
    /**
     * The total spread of the oscillators
     */
    private _spread;
    /**
     * The type of the oscillator
     */
    private _type;
    /**
     * The phase of the oscillators
     */
    private _phase;
    /**
     * The partials array
     */
    private _partials;
    /**
     * The number of partials to use
     */
    private _partialCount;
    /**
     * @param frequency The oscillator's frequency.
     * @param type The type of the oscillator.
     * @param spread The detune spread between the oscillators.
     */
    constructor(frequency?: Frequency, type?: ToneOscillatorType, spread?: Cents);
    constructor(options?: Partial<FatConstructorOptions>);
    static getDefaults(): FatOscillatorOptions;
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
     * Iterate over all of the oscillators
     */
    private _forEach;
    /**
     * The type of the oscillator
     */
    type: ToneOscillatorType;
    /**
     * The detune spread between the oscillators. If "count" is
     * set to 3 oscillators and the "spread" is set to 40,
     * the three oscillators would be detuned like this: [-20, 0, 20]
     * for a total detune spread of 40 cents.
     * @example
     * import { FatOscillator } from "tone";
     * const fatOsc = new FatOscillator().toDestination().start();
     * fatOsc.spread = 70;
     */
    spread: Cents;
    /**
     * The number of detuned oscillators. Must be an integer greater than 1.
     * @example
     * import { FatOscillator } from "tone";
     * const fatOsc = new FatOscillator("C#3", "sawtooth").toDestination().start();
     * // use 4 sawtooth oscillators
     * fatOsc.count = 4;
     */
    count: number;
    phase: Degrees;
    baseType: OscillatorType;
    partials: number[];
    partialCount: number;
    asArray(length?: number): Promise<Float32Array>;
    /**
     * Clean up.
     */
    dispose(): this;
}
