import { ToneAudioBuffer } from "../../core/context/ToneAudioBuffer";
import { Positive, Seconds, Time } from "../../core/type/Units";
import { Source, SourceOptions } from "../Source";
export interface PlayerOptions extends SourceOptions {
    onload: () => void;
    onerror: (error: Error) => void;
    playbackRate: Positive;
    loop: boolean;
    autostart: boolean;
    loopStart: Time;
    loopEnd: Time;
    reverse: boolean;
    fadeIn: Time;
    fadeOut: Time;
    url?: ToneAudioBuffer | string | AudioBuffer;
}
/**
 * Player is an audio file player with start, loop, and stop functions.
 * @example
 * import { Player } from "tone";
 * const player = new Player("https://tonejs.github.io/examples/audio/FWDL.mp3").toDestination();
 * // play as soon as the buffer is loaded
 * player.autostart = true;
 * @category Source
 */
export declare class Player extends Source<PlayerOptions> {
    readonly name: string;
    /**
     * If the file should play as soon
     * as the buffer is loaded.
     */
    autostart: boolean;
    /**
     * The buffer
     */
    private _buffer;
    /**
     * if the buffer should loop once it's over
     */
    private _loop;
    /**
     * if 'loop' is true, the loop will start at this position
     */
    private _loopStart;
    /**
     * if 'loop' is true, the loop will end at this position
     */
    private _loopEnd;
    /**
     * the playback rate
     */
    private _playbackRate;
    /**
     * All of the active buffer source nodes
     */
    private _activeSources;
    /**
     * The fadeIn time of the amplitude envelope.
     */
    fadeIn: Time;
    /**
     * The fadeOut time of the amplitude envelope.
     */
    fadeOut: Time;
    /**
     * @param url Either the AudioBuffer or the url from which to load the AudioBuffer
     * @param onload The function to invoke when the buffer is loaded.
     */
    constructor(url?: string | AudioBuffer | ToneAudioBuffer, onload?: () => void);
    constructor(options?: Partial<PlayerOptions>);
    static getDefaults(): PlayerOptions;
    /**
     * Load the audio file as an audio buffer.
     * Decodes the audio asynchronously and invokes
     * the callback once the audio buffer loads.
     * Note: this does not need to be called if a url
     * was passed in to the constructor. Only use this
     * if you want to manually load a new url.
     * @param url The url of the buffer to load. Filetype support depends on the browser.
     */
    load(url: string): Promise<this>;
    /**
     * Internal callback when the buffer is loaded.
     */
    private _onload;
    /**
     * Internal callback when the buffer is done playing.
     */
    private _onSourceEnd;
    /**
     * Play the buffer at the given startTime. Optionally add an offset
     * and/or duration which will play the buffer from a position
     * within the buffer for the given duration.
     *
     * @param  time When the player should start.
     * @param  offset The offset from the beginning of the sample to start at.
     * @param  duration How long the sample should play. If no duration is given, it will default to the full length of the sample (minus any offset)
     */
    start(time?: Time, offset?: Time, duration?: Time): this;
    /**
     * Internal start method
     */
    protected _start(startTime?: Time, offset?: Time, duration?: Time): void;
    /**
     * Stop playback.
     */
    protected _stop(time?: Time): void;
    /**
     * Stop and then restart the player from the beginning (or offset)
     * @param  time When the player should start.
     * @param  offset The offset from the beginning of the sample to start at.
     * @param  duration How long the sample should play. If no duration is given,
     * 					it will default to the full length of the sample (minus any offset)
     */
    restart(time?: Seconds, offset?: Time, duration?: Time): this;
    protected _restart(time?: Seconds, offset?: Time, duration?: Time): void;
    /**
     * Seek to a specific time in the player's buffer. If the
     * source is no longer playing at that time, it will stop.
     * @param offset The time to seek to.
     * @param when The time for the seek event to occur.
     * @example
     * import { Player } from "tone";
     * const player = new Player("https://tonejs.github.io/examples/audio/FWDL.mp3", () => {
     * 	player.start();
     * 	// seek to the offset in 1 second from now
     * 	player.seek(0.4, "+1");
     * }).toDestination();
     */
    seek(offset: Time, when?: Time): this;
    /**
     * Set the loop start and end. Will only loop if loop is set to true.
     * @param loopStart The loop start time
     * @param loopEnd The loop end time
     * @example
     * import { Player } from "tone";
     * const player = new Player("https://tonejs.github.io/examples/audio/FWDL.mp3").toDestination();
     * // loop between the given points
     * player.setLoopPoints(0.2, 0.3);
     * player.loop = true;
     * player.autostart = true;
     */
    setLoopPoints(loopStart: Time, loopEnd: Time): this;
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
     * The playback speed. 1 is normal speed. This is not a signal because
     * Safari and iOS currently don't support playbackRate as a signal.
     */
    playbackRate: Positive;
    /**
     * The direction the buffer should play in
     */
    reverse: boolean;
    /**
     * If the buffer is loaded
     */
    readonly loaded: boolean;
    dispose(): this;
}
