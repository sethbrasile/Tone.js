import { ToneAudioNodeOptions } from "../core/context/ToneAudioNode";
import { SignalOperator } from "./SignalOperator";
import { WaveShaper } from "./WaveShaper";
/**
 * Return the absolute value of an incoming signal.
 *
 * @example
 * import { Abs, Signal } from "tone";
 * const signal = new Signal(-1);
 * const abs = new Abs();
 * signal.connect(abs);
 * // the output of abs is 1.
 * @category Signal
 */
export declare class Abs extends SignalOperator<ToneAudioNodeOptions> {
    readonly name: string;
    /**
     * The node which converts the audio ranges
     */
    private _abs;
    /**
     * The AudioRange input [-1, 1]
     */
    input: WaveShaper;
    /**
     * The output range [0, 1]
     */
    output: WaveShaper;
    /**
     * clean up
     */
    dispose(): this;
}
