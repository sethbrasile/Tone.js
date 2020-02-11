import { Panner } from "../component/channel/Panner";
import { LFOEffect, LFOEffectOptions } from "./LFOEffect";
import { Frequency } from "../core/type/Units";
export declare type AutoPannerOptions = LFOEffectOptions;
/**
 * AutoPanner is a [[Panner]] with an [[LFO]] connected to the pan amount.
 * [Related Reading](https://www.ableton.com/en/blog/autopan-chopper-effect-and-more-liveschool/).
 *
 * @example
 * import { AutoPanner, Oscillator } from "tone";
 * // create an autopanner and start it
 * const autoPanner = new AutoPanner("4n").toDestination().start();
 * // route an oscillator through the panner and start it
 * const oscillator = new Oscillator().connect(autoPanner).start();
 * @category Effect
 */
export declare class AutoPanner extends LFOEffect<AutoPannerOptions> {
    readonly name: string;
    /**
     * The filter node
     */
    readonly _panner: Panner;
    /**
     * @param frequency Rate of left-right oscillation.
     */
    constructor(frequency?: Frequency);
    constructor(options?: Partial<AutoPannerOptions>);
    dispose(): this;
}
