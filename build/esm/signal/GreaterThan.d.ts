import { ToneAudioNode } from "../core/context/ToneAudioNode";
import { Signal, SignalOptions } from "./Signal";
import { Param } from "../core/context/Param";
export declare type GreaterThanOptions = SignalOptions<"number">;
/**
 * Output 1 if the signal is greater than the value, otherwise outputs 0.
 * can compare two signals or a signal and a number.
 *
 * @example
 * import { GreaterThan, Signal } from "tone";
 * const gt = new GreaterThan(2);
 * const sig = new Signal(4).connect(gt);
 * // output of gt is equal 1.
 */
export declare class GreaterThan extends Signal<"number"> {
    readonly name: string;
    readonly override: boolean;
    readonly input: ToneAudioNode;
    readonly output: ToneAudioNode;
    /**
     * compare that amount to zero after subtracting
     */
    private _gtz;
    /**
     * Subtract the value from the input node
     */
    private _subtract;
    /**
     * The signal to compare to 0.
     */
    readonly comparator: Param<"number">;
    /**
     * @param value The value to compare to
     */
    constructor(value?: number);
    constructor(options?: Partial<GreaterThanOptions>);
    static getDefaults(): GreaterThanOptions;
    dispose(): this;
}
