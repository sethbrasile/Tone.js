import { Param } from "../../core/context/Param";
import { InputNode, OutputNode, ToneAudioNode, ToneAudioNodeOptions } from "../../core/context/ToneAudioNode";
import { AudioRange, Decibels } from "../../core/type/Units";
export interface PanVolOptions extends ToneAudioNodeOptions {
    pan: AudioRange;
    volume: Decibels;
    mute: boolean;
}
/**
 * PanVol is a Tone.Panner and Tone.Volume in one.
 * @example
 * import { Oscillator, PanVol } from "tone";
 * // pan the incoming signal left and drop the volume
 * const panVol = new PanVol(-0.25, -12).toDestination();
 * const osc = new Oscillator().connect(panVol).start();
 * @category Component
 */
export declare class PanVol extends ToneAudioNode<PanVolOptions> {
    readonly name: string;
    readonly input: InputNode;
    readonly output: OutputNode;
    /**
     * The panning node
     */
    private _panner;
    /**
     * The L/R panning control.
     */
    readonly pan: Param<"audioRange">;
    /**
     * The volume node
     */
    private _volume;
    /**
     * The volume control in decibels.
     */
    readonly volume: Param<"decibels">;
    /**
     * @param pan the initial pan
     * @param volume The output volume.
     */
    constructor(pan?: AudioRange, volume?: Decibels);
    constructor(options?: Partial<PanVolOptions>);
    static getDefaults(): PanVolOptions;
    /**
     * Mute/unmute the volume
     */
    mute: boolean;
    dispose(): this;
}
