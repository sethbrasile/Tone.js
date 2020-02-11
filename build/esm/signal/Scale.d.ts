import { InputNode, OutputNode, ToneAudioNodeOptions } from "../core/context/ToneAudioNode";
import { Add } from "./Add";
import { Multiply } from "./Multiply";
import { SignalOperator } from "./SignalOperator";
export interface ScaleOptions extends ToneAudioNodeOptions {
    min: number;
    max: number;
}
/**
 * Performs a linear scaling on an input signal.
 * Scales a NormalRange input to between
 * outputMin and outputMax.
 *
 * @example
 * import { Scale, Signal } from "tone";
 * const scale = new Scale(50, 100);
 * const signal = new Signal(0.5).connect(scale);
 * // the output of scale equals 75
 * @category Signal
 */
export declare class Scale<Options extends ScaleOptions = ScaleOptions> extends SignalOperator<Options> {
    readonly name: string;
    input: InputNode;
    output: OutputNode;
    /**
     * Hold the multiple
     */
    protected _mult: Multiply;
    /**
     * Hold the adder
     */
    protected _add: Add;
    /**
     * Private reference to the min value
     */
    private _min;
    /**
     * Private reference to the max value
     */
    private _max;
    /**
     * @param min The output value when the input is 0.
     * @param max The output value when the input is 1.
     */
    constructor(min?: number, max?: number);
    constructor(options?: Partial<ScaleOptions>);
    static getDefaults(): ScaleOptions;
    /**
     * The minimum output value. This number is output when the value input value is 0.
     */
    min: number;
    /**
     * The maximum output value. This number is output when the value input value is 1.
     */
    max: number;
    /**
     * set the values
     */
    private _setRange;
    dispose(): this;
}
