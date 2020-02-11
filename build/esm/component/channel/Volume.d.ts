import { Gain } from "../../core/context/Gain";
import { Param } from "../../core/context/Param";
import { ToneAudioNode, ToneAudioNodeOptions } from "../../core/context/ToneAudioNode";
import { Decibels } from "../../core/type/Units";
interface VolumeOptions extends ToneAudioNodeOptions {
    volume: Decibels;
    mute: boolean;
}
/**
 * Volume is a simple volume node, useful for creating a volume fader.
 *
 * @example
 * import { Oscillator, Volume } from "tone";
 * const vol = new Volume(-12).toDestination();
 * const osc = new Oscillator().connect(vol).start();
 * @category Component
 */
export declare class Volume extends ToneAudioNode<VolumeOptions> {
    readonly name: string;
    /**
     * the output node
     */
    output: Gain<"decibels">;
    /**
     * Input and output are the same
     */
    input: Gain<"decibels">;
    /**
     * The unmuted volume
     */
    private _unmutedVolume;
    /**
     * The volume control in decibels.
     * @example
     * import { Oscillator, Volume } from "tone";
     * const vol = new Volume().toDestination();
     * const osc = new Oscillator().connect(vol).start();
     * vol.volume.value = -20;
     */
    volume: Param<"decibels">;
    /**
     * @param volume the initial volume in decibels
     */
    constructor(volume?: Decibels);
    constructor(options?: Partial<VolumeOptions>);
    static getDefaults(): VolumeOptions;
    /**
     * Mute the output.
     * @example
     * import { Oscillator, Volume } from "tone";
     * const vol = new Volume(-12).toDestination();
     * const osc = new Oscillator().connect(vol).start();
     * // mute the output
     * vol.mute = true;
     */
    mute: boolean;
    /**
     * clean up
     */
    dispose(): this;
}
export {};
