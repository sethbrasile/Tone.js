import { Tone } from "../Tone";
import { TimeClass } from "../type/Time";
import { Frequency, Hertz, Seconds, Ticks, Time } from "../type/Units";
import { RecursivePartial } from "../util/Interface";
import { BaseContext } from "./BaseContext";
/**
 * A unit which process audio
 */
export interface ToneWithContextOptions {
    context: BaseContext;
}
/**
 * The Base class for all nodes that have an AudioContext.
 */
export declare abstract class ToneWithContext<Options extends ToneWithContextOptions> extends Tone {
    /**
     * The context belonging to the node.
     */
    readonly context: BaseContext;
    /**
     * The default context to use if no AudioContext is passed in to the constructor.
     * Probably should not be set manually. Used internally.
     * @hidden
     */
    readonly defaultContext?: BaseContext;
    /**
     * Pass in a constructor as the first argument
     */
    constructor(context?: BaseContext);
    constructor(options?: Partial<ToneWithContextOptions>);
    static getDefaults(): ToneWithContextOptions;
    /**
     * Return the current time of the Context clock plus the lookAhead.
     */
    now(): Seconds;
    /**
     * Return the current time of the Context clock without any lookAhead.
     */
    immediate(): Seconds;
    /**
     * The duration in seconds of one sample.
     */
    readonly sampleTime: Seconds;
    /**
     * The number of seconds of 1 processing block (128 samples)
     */
    readonly blockTime: Seconds;
    /**
     * Convert the incoming time to seconds
     */
    toSeconds(time?: Time): Seconds;
    /**
     * Convert the input to a frequency number
     */
    toFrequency(freq: Frequency): Hertz;
    /**
     * Convert the input time into ticks
     */
    toTicks(time?: Time | TimeClass): Ticks;
    /**
     * Get a subset of the properties which are in the partial props
     */
    protected _getPartialProperties(props: Options): Partial<Options>;
    /**
     * Get the object's attributes.
     * @example
     * import { Oscillator } from "tone";
     * const osc = new Oscillator();
     * console.log(osc.get());
     * // returns {"type" : "sine", "frequency" : 440, ...etc}
     */
    get(): Options;
    /**
     * Set multiple properties at once with an object.
     * @example
     * import { Filter } from "tone";
     * const filter = new Filter();
     * // set values using an object
     * filter.set({
     * 	frequency: 300,
     * 	type: "highpass"
     * });
     */
    set(props: RecursivePartial<Options>): this;
}
