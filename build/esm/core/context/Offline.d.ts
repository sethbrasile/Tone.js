import { Seconds } from "../type/Units";
import { OfflineContext } from "./OfflineContext";
import { ToneAudioBuffer } from "./ToneAudioBuffer";
/**
 * Generate a buffer by rendering all of the Tone.js code within the callback using the OfflineAudioContext.
 * The OfflineAudioContext is capable of rendering much faster than real time in many cases.
 * The callback function also passes in an offline instance of [[Context]] which can be used
 * to schedule events along the Transport.
 * @param  callback  All Tone.js nodes which are created and scheduled within this callback are recorded into the output Buffer.
 * @param  duration     the amount of time to record for.
 * @return  The promise which is invoked with the ToneAudioBuffer of the recorded output.
 * @example
 * import { Offline, Oscillator } from "tone";
 * // render 2 seconds of the oscillator
 * Offline(() => {
 * 	// only nodes created in this callback will be recorded
 * 	const oscillator = new Oscillator().toDestination().start(0);
 * }, 2).then((buffer) => {
 * 	// do something with the output buffer
 * 	console.log(buffer);
 * });
 * @example
 * import { Offline, Oscillator } from "tone";
 * // can also schedule events along the Transport
 * // using the passed in Offline Transport
 * Offline(({ transport }) => {
 * 	const osc = new Oscillator().toDestination();
 * 	transport.schedule(time => {
 * 		osc.start(time).stop(time + 0.1);
 * 	}, 1);
 * 	// make sure to start the transport
 * 	transport.start(0.2);
 * }, 4).then((buffer) => {
 * 	// do something with the output buffer
 * 	console.log(buffer);
 * });
 * @category Core
 */
export declare function Offline(callback: (context: OfflineContext) => Promise<void> | void, duration: Seconds, channels?: number, sampleRate?: number): Promise<ToneAudioBuffer>;
