import { Scale, ScaleOptions } from "./Scale";
import { Positive } from "../core/type/Units";
export interface ScaleExpOptions extends ScaleOptions {
    exponent: Positive;
}
/**
 * Performs an exponential scaling on an input signal.
 * Scales a NormalRange value [0,1] exponentially
 * to the output range of outputMin to outputMax.
 * @example
 * import { ScaleExp, Signal } from "tone";
 * const scaleExp = new ScaleExp(0, 100, 2);
 * const signal = new Signal(0.5).connect(scaleExp);
 */
export declare class ScaleExp extends Scale<ScaleExpOptions> {
    readonly name: string;
    /**
     * The exponent scaler
     */
    private _exp;
    /**
     * @param min The output value when the input is 0.
     * @param max The output value when the input is 1.
     * @param exponent The exponent which scales the incoming signal.
     */
    constructor(min?: number, max?: number, exponent?: number);
    constructor(options?: Partial<ScaleExpOptions>);
    static getDefaults(): ScaleExpOptions;
    /**
     * Instead of interpolating linearly between the [[min]] and
     * [[max]] values, setting the exponent will interpolate between
     * the two values with an exponential curve.
     */
    exponent: Positive;
    dispose(): this;
}
