import { Param } from "../../core/context/Param";
import { ToneAudioNode, ToneAudioNodeOptions } from "../../core/context/ToneAudioNode";
import { AudioRange } from "../../core/type/Units";
interface TonePannerOptions extends ToneAudioNodeOptions {
    pan: AudioRange;
    channelCount: number;
}
/**
 * Panner is an equal power Left/Right Panner. It is a wrapper around the StereoPannerNode.
 * @example
 * import { Oscillator, Panner } from "tone";
 * // pan the input signal hard right.
 * const panner = new Panner(1).toDestination();
 * const osc = new Oscillator().connect(panner).start();
 * @category Component
 */
export declare class Panner extends ToneAudioNode<TonePannerOptions> {
    readonly name: string;
    /**
     * the panner node
     */
    private _panner;
    readonly input: StereoPannerNode;
    readonly output: StereoPannerNode;
    /**
     * The pan control. -1 = hard left, 1 = hard right.
     * @min -1
     * @max 1
     */
    readonly pan: Param<"audioRange">;
    constructor(options?: Partial<TonePannerOptions>);
    /**
     * @param pan The initial panner value (Defaults to 0 = "center").
     */
    constructor(pan?: AudioRange);
    static getDefaults(): TonePannerOptions;
    dispose(): this;
}
export {};
