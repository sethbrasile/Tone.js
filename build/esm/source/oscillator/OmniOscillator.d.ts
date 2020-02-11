import { Cents, Degrees, Frequency, Seconds, Time } from "../../core/type/Units";
import { Signal } from "../../signal/Signal";
import { Source } from "../Source";
import { AMOscillator } from "./AMOscillator";
import { FatOscillator } from "./FatOscillator";
import { FMOscillator } from "./FMOscillator";
import { Oscillator } from "./Oscillator";
import { OmniOscillatorConstructorOptions, OmniOscillatorOptions, OmniOscillatorType, ToneOscillatorInterface, ToneOscillatorType } from "./OscillatorInterface";
import { PulseOscillator } from "./PulseOscillator";
import { PWMOscillator } from "./PWMOscillator";
export { OmniOscillatorOptions } from "./OscillatorInterface";
/**
 * All of the oscillator types that OmniOscillator can take on
 */
declare type AnyOscillator = Oscillator | PWMOscillator | PulseOscillator | FatOscillator | AMOscillator | FMOscillator;
/**
 * All of the Oscillator constructor types mapped to their name.
 */
interface OmniOscillatorSource {
    "fm": FMOscillator;
    "am": AMOscillator;
    "pwm": PWMOscillator;
    "pulse": PulseOscillator;
    "oscillator": Oscillator;
    "fat": FatOscillator;
}
/**
 * The available oscillator types.
 */
export declare type OmniOscSourceType = keyof OmniOscillatorSource;
declare type IsAmOrFmOscillator<Osc, Ret> = Osc extends AMOscillator ? Ret : Osc extends FMOscillator ? Ret : undefined;
declare type IsFatOscillator<Osc, Ret> = Osc extends FatOscillator ? Ret : undefined;
declare type IsPWMOscillator<Osc, Ret> = Osc extends PWMOscillator ? Ret : undefined;
declare type IsPulseOscillator<Osc, Ret> = Osc extends PulseOscillator ? Ret : undefined;
declare type IsFMOscillator<Osc, Ret> = Osc extends FMOscillator ? Ret : undefined;
/**
 * OmniOscillator aggregates Tone.Oscillator, Tone.PulseOscillator,
 * Tone.PWMOscillator, Tone.FMOscillator, Tone.AMOscillator, and Tone.FatOscillator
 * into one class. The oscillator class can be changed by setting the `type`.
 * `omniOsc.type = "pwm"` will set it to the Tone.PWMOscillator. Prefixing
 * any of the basic types ("sine", "square4", etc.) with "fm", "am", or "fat"
 * will use the FMOscillator, AMOscillator or FatOscillator respectively.
 * For example: `omniOsc.type = "fatsawtooth"` will create set the oscillator
 * to a FatOscillator of type "sawtooth".
 * @example
 * import { OmniOscillator } from "tone";
 * const omniOsc = new OmniOscillator("C#4", "pwm");
 * @category Source
 */
export declare class OmniOscillator<OscType extends AnyOscillator> extends Source<OmniOscillatorConstructorOptions> implements Omit<ToneOscillatorInterface, "type"> {
    readonly name: string;
    readonly frequency: Signal<"frequency">;
    readonly detune: Signal<"cents">;
    /**
     * The oscillator that can switch types
     */
    private _oscillator;
    /**
     * the type of the oscillator source
     */
    private _sourceType;
    /**
     * @param frequency The initial frequency of the oscillator.
     * @param type The type of the oscillator.
     */
    constructor(frequency?: Frequency, type?: OmniOscillatorType);
    constructor(options?: Partial<OmniOscillatorConstructorOptions>);
    static getDefaults(): OmniOscillatorOptions;
    /**
     * start the oscillator
     */
    protected _start(time: Time): void;
    /**
     * start the oscillator
     */
    protected _stop(time: Time): void;
    protected _restart(time: Seconds): this;
    /**
     * The type of the oscillator. Can be any of the basic types: sine, square, triangle, sawtooth. Or
     * prefix the basic types with "fm", "am", or "fat" to use the FMOscillator, AMOscillator or FatOscillator
     * types. The oscillator could also be set to "pwm" or "pulse". All of the parameters of the
     * oscillator's class are accessible when the oscillator is set to that type, but throws an error
     * when it's not.
     * @example
     * import { OmniOscillator } from "tone";
     * const omniOsc = new OmniOscillator().toDestination().start();
     * omniOsc.type = "pwm";
     * // modulationFrequency is parameter which is available
     * // only when the type is "pwm".
     * omniOsc.modulationFrequency.value = 0.5;
     * @example
     * import { OmniOscillator } from "tone";
     * const omniOsc = new OmniOscillator().toDestination().start();
     * // an square wave frequency modulated by a sawtooth
     * omniOsc.type = "fmsquare";
     * omniOsc.modulationType = "sawtooth";
     */
    type: OmniOscillatorType;
    /**
     * The value is an empty array when the type is not "custom".
     * This is not available on "pwm" and "pulse" oscillator types.
     * See [[Oscillator.partials]]
     */
    partials: number[];
    partialCount: number;
    set(props: Partial<OmniOscillatorConstructorOptions>): this;
    /**
     * connect the oscillator to the frequency and detune signals
     */
    private _createNewOscillator;
    phase: Degrees;
    /**
     * The source type of the oscillator.
     * @example
     * import { OmniOscillator } from "tone";
     * const omniOsc = new OmniOscillator(440, "fmsquare");
     * console.log(omniOsc.sourceType); // 'fm'
     */
    sourceType: OmniOscSourceType;
    private _getOscType;
    /**
     * The base type of the oscillator. See [[Oscillator.baseType]]
     * @example
     * import { OmniOscillator } from "tone";
     * const omniOsc = new OmniOscillator(440, "fmsquare4");
     * omniOsc.sourceType; // 'fm'
     * omniOsc.baseType; // 'square'
     * omniOsc.partialCount; // 4
     */
    baseType: OscillatorType | "pwm" | "pulse";
    /**
     * The width of the oscillator when sourceType === "pulse".
     * See [[PWMOscillator.width]]
     * @example
     * import { OmniOscillator } from "tone";
     * const omniOsc = new OmniOscillator(440, "pulse");
     * // can access the width attribute only if type === "pulse"
     * omniOsc.width.value = 0.2;
     */
    readonly width: IsPulseOscillator<OscType, Signal<"audioRange">>;
    /**
     * The number of detuned oscillators when sourceType === "fat".
     * See [[FatOscillator.count]]
     */
    count: IsFatOscillator<OscType, number>;
    /**
     * The detune spread between the oscillators when sourceType === "fat".
     * See [[FatOscillator.count]]
     */
    spread: IsFatOscillator<OscType, Cents>;
    /**
     * The type of the modulator oscillator. Only if the oscillator is set to "am" or "fm" types.
     * See [[AMOscillator]] or [[FMOscillator]]
     */
    modulationType: IsAmOrFmOscillator<OscType, ToneOscillatorType>;
    /**
     * The modulation index when the sourceType === "fm"
     * See [[FMOscillator]].
     */
    readonly modulationIndex: IsFMOscillator<OscType, Signal<"positive">>;
    /**
     * Harmonicity is the frequency ratio between the carrier and the modulator oscillators.
     * See [[AMOscillator]] or [[FMOscillator]]
     */
    readonly harmonicity: IsAmOrFmOscillator<OscType, Signal<"positive">>;
    /**
     * The modulationFrequency Signal of the oscillator when sourceType === "pwm"
     * see [[PWMOscillator]]
     * @min 0.1
     * @max 5
     */
    readonly modulationFrequency: IsPWMOscillator<OscType, Signal<"frequency">>;
    asArray(length?: number): Promise<Float32Array>;
    dispose(): this;
}
