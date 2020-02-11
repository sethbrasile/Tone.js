import { Param } from "../../core/context/Param";
import { ToneAudioBuffer } from "../../core/context/ToneAudioBuffer";
import { GainFactor, Positive, Seconds, Time } from "../../core/type/Units";
import { OneShotSource, OneShotSourceCurve, OneShotSourceOptions } from "../OneShotSource";
export declare type ToneBufferSourceCurve = OneShotSourceCurve;
export interface ToneBufferSourceOptions extends OneShotSourceOptions {
    url: string | AudioBuffer | ToneAudioBuffer;
    curve: ToneBufferSourceCurve;
    playbackRate: Positive;
    fadeIn: Time;
    fadeOut: Time;
    loopStart: Time;
    loopEnd: Time;
    loop: boolean;
    onload: () => void;
    onerror: (error: Error) => void;
}
/**
 * Wrapper around the native BufferSourceNode.
 * @category Source
 */
export declare class ToneBufferSource extends OneShotSource<ToneBufferSourceOptions> {
    readonly name: string;
    /**
     * The oscillator
     */
    private _source;
    protected _internalChannels: AudioBufferSourceNode[];
    /**
     * The frequency of the oscillator
     */
    readonly playbackRate: Param<"positive">;
    /**
     * The private instance of the buffer object
     */
    private _buffer;
    /**
     * indicators if the source has started/stopped
     */
    private _sourceStarted;
    private _sourceStopped;
    /**
     * @param url The buffer to play or url to load
     * @param onload The callback to invoke when the buffer is done playing.
     */
    constructor(url?: ToneAudioBuffer | AudioBuffer | string, onload?: () => void);
    constructor(options?: Partial<ToneBufferSourceOptions>);
    static getDefaults(): ToneBufferSourceOptions;
    /**
     * The fadeIn time of the amplitude envelope.
     */
    fadeIn: Time;
    /**
     * The fadeOut time of the amplitude envelope.
     */
    fadeOut: Time;
    /**
     * The curve applied to the fades, either "linear" or "exponential"
     */
    curve: ToneBufferSourceCurve;
    /**
     * Start the buffer
     * @param  time When the player should start.
     * @param  offset The offset from the beginning of the sample to start at.
     * @param  duration How long the sample should play. If no duration is given, it will default to the full length of the sample (minus any offset)
     * @param  gain  The gain to play the buffer back at.
     */
    start(time?: Time, offset?: Time, duration?: Time, gain?: GainFactor): this;
    protected _stopSource(time?: Seconds): void;
    /**
     * If loop is true, the loop will start at this position.
     */
    loopStart: Time;
    /**
     * If loop is true, the loop will end at this position.
     */
    loopEnd: Time;
    /**
     * The audio buffer belonging to the player.
     */
    buffer: ToneAudioBuffer;
    /**
     * If the buffer should loop once it's over.
     */
    loop: boolean;
    /**
     * Clean up.
     */
    dispose(): this;
}
