export { getContext, setContext } from "./core/Global";
export * from "./classes";
export * from "./version";
import { getContext } from "./core/Global";
import { ToneAudioBuffer } from "./core/context/ToneAudioBuffer";
export { start } from "./core/Global";
/**
 * The current audio context time of the global [[Context]].
 * See [[Context.now]]
 * @category Core
 */
export var now = getContext().now.bind(getContext());
/**
 * The current audio context time of the global [[Context]] without the [[Context.lookAhead]]
 * See [[Context.immediate]]
 * @category Core
 */
export var immediate = getContext().immediate.bind(getContext());
/**
 * The Transport object belonging to the global Tone.js Context.
 * See [[Transport]]
 * @category Core
 */
export var Transport = getContext().transport;
/**
 * The Destination (output) belonging to the global Tone.js Context.
 * See [[Destination]]
 * @category Core
 */
export var Destination = getContext().destination;
/**
 * The [[Listener]] belonging to the global Tone.js Context.
 * @category Core
 */
export var Listener = getContext().listener;
/**
 * Draw is used to synchronize the draw frame with the Transport's callbacks.
 * See [[Draw]]
 * @category Core
 */
export var Draw = getContext().draw;
/**
 * A reference to the global context
 * See [[Context]]
 * @category Core
 */
export var context = getContext();
/**
 * Promise which resolves when all of the loading promises are resolved.
 * Alias for static [[ToneAudioBuffer.loaded]] method.
 * @category Core
 */
export var loaded = ToneAudioBuffer.loaded.bind(ToneAudioBuffer);
// this fills in name changes from 13.x to 14.x
import { ToneAudioBuffers } from "./core/context/ToneAudioBuffers";
import { ToneBufferSource } from "./source/buffer/ToneBufferSource";
export var Buffer = ToneAudioBuffer;
export var Buffers = ToneAudioBuffers;
export var BufferSource = ToneBufferSource;
//# sourceMappingURL=index.js.map