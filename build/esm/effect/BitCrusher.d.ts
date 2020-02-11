import { ToneAudioWorkletOptions } from "../core/context/ToneAudioWorklet";
import { Effect, EffectOptions } from "./Effect";
import { NormalRange, Positive } from "../core/type/Units";
import { Param } from "../core/context/Param";
export interface BitCrusherOptions extends EffectOptions {
    bits: Positive;
}
/**
 * BitCrusher down-samples the incoming signal to a different bit depth.
 * Lowering the bit depth of the signal creates distortion. Read more about BitCrushing
 * on [Wikipedia](https://en.wikipedia.org/wiki/Bitcrusher).
 * @example
 * import { BitCrusher, Synth } from "tone";
 * // initialize crusher and route a synth through it
 * const crusher = new BitCrusher(4).toDestination();
 * const synth = new Synth().connect(crusher);
 * synth.triggerAttackRelease("C2", 2);
 *
 * @category Effect
 */
export declare class BitCrusher extends Effect<BitCrusherOptions> {
    readonly name: string;
    /**
     * The bit depth of the effect
     * @min 1
     * @max 16
     */
    readonly bits: Param<"positive">;
    /**
     * The node which does the bit crushing effect. Runs in an AudioWorklet when possible.
     */
    private _bitCrusherWorklet;
    constructor(bits?: Positive, frequencyReduction?: NormalRange);
    constructor(options?: Partial<BitCrusherWorkletOptions>);
    static getDefaults(): BitCrusherOptions;
    dispose(): this;
}
interface BitCrusherWorkletOptions extends ToneAudioWorkletOptions {
    bits: number;
}
export {};
