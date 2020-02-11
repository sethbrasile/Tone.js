import { Effect, EffectOptions } from "./Effect";
export interface DistortionOptions extends EffectOptions {
    distortion: number;
    oversample: OverSampleType;
}
/**
 * A simple distortion effect using Tone.WaveShaper.
 * Algorithm from [this stackoverflow answer](http://stackoverflow.com/a/22313408).
 *
 * @example
 * import { Distortion, FMSynth } from "tone";
 * const dist = new Distortion(0.8).toDestination();
 * const fm = new FMSynth().connect(dist);
 * fm.triggerAttackRelease("A1", "8n");
 * @category Effect
 */
export declare class Distortion extends Effect<DistortionOptions> {
    readonly name: string;
    /**
     * The waveshaper which does the distortion
     */
    private _shaper;
    /**
     * Stores the distortion value
     */
    private _distortion;
    /**
     * @param distortion The amount of distortion (nominal range of 0-1)
     */
    constructor(distortion?: number);
    constructor(options?: Partial<DistortionOptions>);
    static getDefaults(): DistortionOptions;
    /**
     * The amount of distortion. Nominal range is between 0 and 1.
     */
    distortion: number;
    /**
     * The oversampling of the effect. Can either be "none", "2x" or "4x".
     */
    oversample: OverSampleType;
    dispose(): this;
}
