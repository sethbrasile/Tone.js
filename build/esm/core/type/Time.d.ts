import { TimeBaseClass, TimeBaseUnit, TimeExpression, TimeValue } from "./TimeBase";
import { BarsBeatsSixteenths, MidiNote, Seconds, Subdivision, Ticks, Time } from "./Units";
/**
 * TimeClass is a primitive type for encoding and decoding Time values.
 * TimeClass can be passed into the parameter of any method which takes time as an argument.
 * @param  val    The time value.
 * @param  units  The units of the value.
 * @example
 * import { Time } from "tone";
 * const time = Time("4n"); // a quarter note
 * @category Unit
 */
export declare class TimeClass<Type extends Seconds | Ticks = Seconds, Unit extends string = TimeBaseUnit> extends TimeBaseClass<Type, Unit> {
    readonly name: string;
    protected _getExpressions(): TimeExpression<Type>;
    /**
     * Quantize the time by the given subdivision. Optionally add a
     * percentage which will move the time value towards the ideal
     * quantized value by that percentage.
     * @param  subdiv    The subdivision to quantize to
     * @param  percent  Move the time value towards the quantized value by a percentage.
     * @example
     * import { Time } from "tone";
     * Time(21).quantize(2); // returns 22
     * Time(0.6).quantize("4n", 0.5); // returns 0.55
     */
    quantize(subdiv: Time, percent?: number): Type;
    /**
     * Convert a Time to Notation. The notation values are will be the
     * closest representation between 1m to 128th note.
     * @return {Notation}
     * @example
     * import { Time } from "tone";
     * // if the Transport is at 120bpm:
     * Time(2).toNotation(); // returns "1m"
     */
    toNotation(): Subdivision;
    /**
     * Return the time encoded as Bars:Beats:Sixteenths.
     */
    toBarsBeatsSixteenths(): BarsBeatsSixteenths;
    /**
     * Return the time in ticks.
     */
    toTicks(): Ticks;
    /**
     * Return the time in seconds.
     */
    toSeconds(): Seconds;
    /**
     * Return the value as a midi note.
     */
    toMidi(): MidiNote;
    protected _now(): Type;
}
/**
 * Create a TimeClass from a time string or number.
 * @param value A value which reprsents time
 * @param units The value's units if they can't be inferred by the value.
 * @category Unit
 */
export declare function Time(value?: TimeValue, units?: TimeBaseUnit): TimeClass<Seconds>;
