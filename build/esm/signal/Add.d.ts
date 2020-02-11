import { Gain } from "../core/context/Gain";
import { Param } from "../core/context/Param";
import { Signal, SignalOptions } from "./Signal";
/**
 * Add a signal and a number or two signals. When no value is
 * passed into the constructor, Tone.Add will sum input and `addend`
 * If a value is passed into the constructor, the it will be added to the input.
 *
 * @example
 * import { Add, Signal } from "tone";
 * const signal = new Signal(2);
 * // add a signal and a scalar
 * const add = new Add(2);
 * signal.connect(add);
 * // the output of add equals 4
 * @example
 * import { Add, Signal } from "tone";
 * // Add two signal inputs
 * const add = new Add();
 * const sig0 = new Signal(3).connect(add);
 * const sig1 = new Signal(4).connect(add.addend);
 * // the output of add equals 7.
 * @category Signal
 */
export declare class Add extends Signal {
    override: boolean;
    readonly name: string;
    /**
     * the summing node
     */
    private _sum;
    readonly input: Gain<"gain">;
    readonly output: Gain<"gain">;
    /**
     * The value which is added to the input signal
     */
    readonly addend: Param<"number">;
    /**
     * @param value If no value is provided, will sum the input and [[addend]].
     */
    constructor(value?: number);
    constructor(options?: Partial<SignalOptions<"number">>);
    static getDefaults(): SignalOptions<"number">;
    dispose(): this;
}
