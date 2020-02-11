import { SignalOperator, SignalOperatorOptions } from "./SignalOperator";
import { ToneAudioNode } from "../core/context/ToneAudioNode";
export declare type GreaterThanZeroOptions = SignalOperatorOptions;
/**
 * GreaterThanZero outputs 1 when the input is strictly greater than zero
 * @example
 * import { GreaterThanZero, Signal } from "tone";
 * const gt0 = new GreaterThanZero();
 * const sig = new Signal(0.01).connect(gt0);
 * // the output of gt0 is 1.
 * sig.value = 0;
 * // the output of gt0 is 0.
 */
export declare class GreaterThanZero extends SignalOperator<GreaterThanZeroOptions> {
    readonly name: string;
    /**
     * The waveshaper
     */
    private _thresh;
    /**
     * Scale the first thresholded signal by a large value.
     * this will help with values which are very close to 0
     */
    private _scale;
    readonly output: ToneAudioNode;
    readonly input: ToneAudioNode;
    constructor(options?: Partial<GreaterThanZeroOptions>);
    dispose(): this;
}
