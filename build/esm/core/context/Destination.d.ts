import { Volume } from "../../component/channel/Volume";
import { Decibels } from "../type/Units";
import { Gain } from "./Gain";
import { Param } from "./Param";
import { ToneAudioNode, ToneAudioNodeOptions } from "./ToneAudioNode";
interface DestinationOptions extends ToneAudioNodeOptions {
    volume: Decibels;
    mute: boolean;
}
/**
 * A single master output which is connected to the
 * AudioDestinationNode (aka your speakers).
 * It provides useful conveniences such as the ability
 * to set the volume and mute the entire application.
 * It also gives you the ability to apply master effects to your application.
 *
 * @example
 * import { Destination, Oscillator } from "tone";
 * const oscillator = new Oscillator().start();
 * // the audio will go from the oscillator to the speakers
 * oscillator.connect(Destination);
 * // a convenience for connecting to the master output is also provided:
 * oscillator.toDestination();
 * // these two are equivalent.
 * @category Core
 */
export declare class Destination extends ToneAudioNode<DestinationOptions> {
    readonly name: string;
    input: Volume;
    output: Gain;
    /**
     * The volume of the master output.
     */
    volume: Param<"decibels">;
    constructor(options: Partial<DestinationOptions>);
    static getDefaults(): DestinationOptions;
    /**
     * Mute the output.
     * @example
     * import { Destination, Oscillator } from "tone";
     * const oscillator = new Oscillator().start().toDestination();
     * // mute the output
     * Destination.mute = true;
     */
    mute: boolean;
    /**
     * Add a master effects chain. NOTE: this will disconnect any nodes which were previously
     * chained in the master effects chain.
     * @param args All arguments will be connected in a row and the Master will be routed through it.
     * @return  {Destination}  this
     * @example
     * import { Compressor, Destination, Filter } from "tone";
     * // some overall compression to keep the levels in check
     * const masterCompressor = new Compressor({
     * 	threshold: -6,
     * 	ratio: 3,
     * 	attack: 0.5,
     * 	release: 0.1
     * });
     * // give a little boost to the lows
     * const lowBump = new Filter(200, "lowshelf");
     * // route everything through the filter and compressor before going to the speakers
     * Destination.chain(lowBump, masterCompressor);
     */
    chain(...args: Array<AudioNode | ToneAudioNode>): this;
    /**
     * Clean up
     */
    dispose(): this;
}
export {};
