import { ToneAudioNode, ToneAudioNodeOptions } from "./ToneAudioNode";
export declare type ToneAudioWorkletOptions = ToneAudioNodeOptions;
export declare abstract class ToneAudioWorklet<Options extends ToneAudioWorkletOptions> extends ToneAudioNode<Options> {
    readonly name: string;
    /**
     * The processing node
     */
    protected _worklet: AudioWorkletNode;
    /**
     * The constructor options for the node
     */
    protected workletOptions: Partial<AudioWorkletNodeOptions>;
    /**
     * The code which is run in the worklet
     */
    protected abstract _audioWorklet(): string;
    /**
     * Get the name of the audio worklet
     */
    protected abstract _audioWorkletName(): string;
    /**
     * Invoked when the module is loaded and the node is created
     */
    protected abstract onReady(node: AudioWorkletNode): void;
    /**
     * Callback which is invoked when there is an error in the processing
     */
    onprocessorerror: (e: string) => void;
    constructor(options: Options);
    dispose(): this;
}
