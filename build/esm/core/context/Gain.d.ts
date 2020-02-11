import { Param } from "../context/Param";
import { UnitMap, UnitName } from "../type/Units";
import { ToneAudioNode, ToneAudioNodeOptions } from "./ToneAudioNode";
interface GainOptions<TypeName extends UnitName> extends ToneAudioNodeOptions {
    gain: UnitMap[TypeName];
    units: TypeName;
    convert: boolean;
    minValue?: number;
    maxValue?: number;
}
/**
 * A thin wrapper around the Native Web Audio GainNode.
 * The GainNode is a basic building block of the Web Audio
 * API and is useful for routing audio and adjusting gains.
 * @category Core
 */
export declare class Gain<TypeName extends "gain" | "decibels" | "normalRange" = "gain"> extends ToneAudioNode<GainOptions<TypeName>> {
    readonly name: string;
    /**
     * The gain parameter of the gain node.
     */
    readonly gain: Param<TypeName>;
    /**
     * The wrapped GainNode.
     */
    private _gainNode;
    readonly input: GainNode;
    readonly output: GainNode;
    /**
     * @param  gain The initial gain of the GainNode
     * @param units The units of the gain parameter.
     */
    constructor(gain?: UnitMap[TypeName], units?: TypeName);
    constructor(options?: Partial<GainOptions<TypeName>>);
    static getDefaults(): GainOptions<any>;
    /**
     * Clean up.
     */
    dispose(): this;
}
export {};
