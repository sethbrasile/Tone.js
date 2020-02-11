import { Param } from "../context/Param";
import { Seconds, Time } from "../type/Units";
import { ToneAudioNode, ToneAudioNodeOptions } from "./ToneAudioNode";
export interface DelayOptions extends ToneAudioNodeOptions {
    delayTime: Time;
    maxDelay: Time;
}
/**
 * Wrapper around Web Audio's native [DelayNode](http://webaudio.github.io/web-audio-api/#the-delaynode-interface).
 * @category Core
 */
export declare class Delay extends ToneAudioNode<DelayOptions> {
    readonly name: string;
    /**
     * Private holder of the max delay time
     */
    private _maxDelay;
    /**
     * The amount of time the incoming signal is delayed.
     */
    readonly delayTime: Param<"time">;
    /**
     * Private reference to the internal DelayNode
     */
    private _delayNode;
    readonly input: DelayNode;
    readonly output: DelayNode;
    /**
     * @param delayTime The delay applied to the incoming signal.
     * @param maxDelay The maximum delay time.
     */
    constructor(delayTime?: Time, maxDelay?: Time);
    constructor(options?: Partial<DelayOptions>);
    static getDefaults(): DelayOptions;
    /**
     * The maximum delay time. This cannot be changed after
     * the value is passed into the constructor.
     */
    readonly maxDelay: Seconds;
    /**
     * Clean up.
     */
    dispose(): this;
}
