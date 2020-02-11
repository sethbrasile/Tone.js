import { Degrees, Frequency, Seconds } from "../../core/type/Units";
import { Signal } from "../../signal/Signal";
import { Source } from "../Source";
import { AMConstructorOptions, AMOscillatorOptions, ToneOscillatorInterface, ToneOscillatorType } from "./OscillatorInterface";
export { AMOscillatorOptions } from "./OscillatorInterface";
/**
 * An amplitude modulated oscillator node. It is implemented with
 * two oscillators, one which modulators the other's amplitude
 * through a gain node.
 * ```
 *    +-------------+       +----------+
 *    | Carrier Osc +>------> GainNode |
 *    +-------------+       |          +--->Output
 *                      +---> gain     |
 * +---------------+    |   +----------+
 * | Modulator Osc +>---+
 * +---------------+
 * ```
 *
 * @example
 * import { AMOscillator } from "tone";
 * // a sine oscillator amplitude-modulated by a square wave
 * const amOsc = new AMOscillator("Ab3", "sine", "square").toDestination().start().stop("+5");
 * // schedule a series of notes
 * amOsc.frequency.setValueAtTime("F3", "+0.25");
 * amOsc.frequency.setValueAtTime("C4", "+0.5");
 * amOsc.frequency.setValueAtTime("Bb3", "+1");
 * // schedule harmonicity changes along with those notes
 * amOsc.harmonicity.setValueAtTime(0.5, "+0.25");
 * amOsc.harmonicity.setValueAtTime(1, "+1");
 * amOsc.harmonicity.linearRampTo(1.1, 2, "+1");
 * // fade it out all the way at the end
 * amOsc.volume.exponentialRampTo(-Infinity, 3, "+2,");
 * @category Source
 */
export declare class AMOscillator extends Source<AMOscillatorOptions> implements ToneOscillatorInterface {
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
     * convert the -1,1 output to 0,1
     */
    private _modulationScale;
    /**
     * Harmonicity is the frequency ratio between the carrier and the modulator oscillators.
     * A harmonicity of 1 gives both oscillators the same frequency.
     * Harmonicity = 2 means a change of an octave.
     * @example
     * import { AMOscillator, Transport } from "tone";
     * const amOsc = new AMOscillator("D2").toDestination().start();
     * Transport.scheduleRepeat(time => {
     * 	amOsc.harmonicity.setValueAtTime(1, time);
     * 	amOsc.harmonicity.setValueAtTime(0.5, time + 0.5);
     * 	amOsc.harmonicity.setValueAtTime(1.5, time + 1);
     * 	amOsc.harmonicity.setValueAtTime(1, time + 2);
     * 	amOsc.harmonicity.linearRampToValueAtTime(2, time + 4);
     * }, 4);
     * Transport.start();
     */
    readonly harmonicity: Signal<"positive">;
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
    constructor(options?: Partial<AMConstructorOptions>);
    static getDefaults(): AMOscillatorOptions;
    /**
     * start the oscillator
     */
    protected _start(time: Seconds): void;
    /**
     * stop the oscillator
     */
    protected _stop(time: Seconds): void;
    protected _restart(time: Seconds): void;
    /**
     * The type of the carrier oscillator
     */
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
