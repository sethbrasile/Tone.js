import { ToneAudioNode, ToneAudioNodeOptions } from "../../core/context/ToneAudioNode";
import { Decibels, Time } from "../../core/type/Units";
export interface GateOptions extends ToneAudioNodeOptions {
    threshold: Decibels;
    smoothing: Time;
}
/**
 * Gate only passes a signal through when the incoming
 * signal exceeds a specified threshold. It uses [[Follower]] to follow the ampltiude
 * of the incoming signal and compares it to the [[threshold]] value using [[GreaterThan]].
 *
 * @example
 * import { Gate, UserMedia } from "tone";
 * const gate = new Gate(-30, 0.2).toDestination();
 * const mic = new UserMedia().connect(gate);
 * // the gate will only pass through the incoming
 * // signal when it's louder than -30db
 */
export declare class Gate extends ToneAudioNode<GateOptions> {
    readonly name: string;
    readonly input: ToneAudioNode;
    readonly output: ToneAudioNode;
    /**
     * Follow the incoming signal
     */
    private _follower;
    /**
     * Test if it's greater than the threshold
     */
    private _gt;
    /**
     * Gate the incoming signal when it does not exceed the threshold
     */
    private _gate;
    /**
     * @param threshold The threshold above which the gate will open.
     * @param smoothing The follower's smoothing time
     */
    constructor(threshold?: Decibels, smoothing?: Time);
    constructor(options?: Partial<GateOptions>);
    static getDefaults(): GateOptions;
    /**
     * The threshold of the gate in decibels
     */
    threshold: Decibels;
    /**
     * The attack/decay speed of the gate. See [[Follower.smoothing]]
     */
    smoothing: Time;
    dispose(): this;
}
