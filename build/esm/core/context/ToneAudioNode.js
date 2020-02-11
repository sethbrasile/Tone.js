import * as tslib_1 from "tslib";
import { isAudioNode, isAudioParam } from "../util/AdvancedTypeCheck";
import { isDefined } from "../util/TypeCheck";
import { Param } from "./Param";
import { ToneWithContext } from "./ToneWithContext";
import { assert, warn } from "../util/Debug";
/**
 * ToneAudioNode is the base class for classes which process audio.
 */
var ToneAudioNode = /** @class */ (function (_super) {
    tslib_1.__extends(ToneAudioNode, _super);
    function ToneAudioNode() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /**
         * The name of the class
         */
        _this.name = "ToneAudioNode";
        /**
         * List all of the node that must be set to match the ChannelProperties
         */
        _this._internalChannels = [];
        return _this;
    }
    Object.defineProperty(ToneAudioNode.prototype, "numberOfInputs", {
        /**
         * The number of inputs feeding into the AudioNode.
         * For source nodes, this will be 0.
         */
        get: function () {
            if (isDefined(this.input)) {
                if (isAudioParam(this.input) || this.input instanceof Param) {
                    return 1;
                }
                else {
                    return this.input.numberOfInputs;
                }
            }
            else {
                return 0;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ToneAudioNode.prototype, "numberOfOutputs", {
        /**
         * The number of outputs of the AudioNode.
         */
        get: function () {
            if (isDefined(this.output)) {
                return this.output.numberOfOutputs;
            }
            else {
                return 0;
            }
        },
        enumerable: true,
        configurable: true
    });
    //-------------------------------------
    // AUDIO PROPERTIES
    //-------------------------------------
    /**
     * Used to decide which nodes to get/set properties on
     */
    ToneAudioNode.prototype._isAudioNode = function (node) {
        return isDefined(node) && (node instanceof ToneAudioNode || isAudioNode(node));
    };
    /**
     * Get all of the audio nodes (either internal or input/output) which together
     * make up how the class node responds to channel input/output
     */
    ToneAudioNode.prototype._getInternalNodes = function () {
        var nodeList = this._internalChannels.slice(0);
        if (this._isAudioNode(this.input)) {
            nodeList.push(this.input);
        }
        if (this._isAudioNode(this.output)) {
            if (this.input !== this.output) {
                nodeList.push(this.output);
            }
        }
        return nodeList;
    };
    /**
     * Set the audio options for this node such as channelInterpretation
     * channelCount, etc.
     * @param options
     */
    ToneAudioNode.prototype._setChannelProperties = function (options) {
        var nodeList = this._getInternalNodes();
        nodeList.forEach(function (node) {
            node.channelCount = options.channelCount;
            node.channelCountMode = options.channelCountMode;
            node.channelInterpretation = options.channelInterpretation;
        });
    };
    /**
     * Get the current audio options for this node such as channelInterpretation
     * channelCount, etc.
     */
    ToneAudioNode.prototype._getChannelProperties = function () {
        var nodeList = this._getInternalNodes();
        assert(nodeList.length > 0, "ToneAudioNode does not have any internal nodes");
        // use the first node to get properties
        // they should all be the same
        var node = nodeList[0];
        return {
            channelCount: node.channelCount,
            channelCountMode: node.channelCountMode,
            channelInterpretation: node.channelInterpretation,
        };
    };
    Object.defineProperty(ToneAudioNode.prototype, "channelCount", {
        /**
         * channelCount is the number of channels used when up-mixing and down-mixing
         * connections to any inputs to the node. The default value is 2 except for
         * specific nodes where its value is specially determined.
         */
        get: function () {
            return this._getChannelProperties().channelCount;
        },
        set: function (channelCount) {
            var props = this._getChannelProperties();
            // merge it with the other properties
            this._setChannelProperties(Object.assign(props, { channelCount: channelCount }));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ToneAudioNode.prototype, "channelCountMode", {
        /**
         * channelCountMode determines how channels will be counted when up-mixing and
         * down-mixing connections to any inputs to the node.
         * The default value is "max". This attribute has no effect for nodes with no inputs.
         * * "max" - computedNumberOfChannels is the maximum of the number of channels of all connections to an input. In this mode channelCount is ignored.
         * * "clamped-max" - computedNumberOfChannels is determined as for "max" and then clamped to a maximum value of the given channelCount.
         * * "explicit" - computedNumberOfChannels is the exact value as specified by the channelCount.
         */
        get: function () {
            return this._getChannelProperties().channelCountMode;
        },
        set: function (channelCountMode) {
            var props = this._getChannelProperties();
            // merge it with the other properties
            this._setChannelProperties(Object.assign(props, { channelCountMode: channelCountMode }));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ToneAudioNode.prototype, "channelInterpretation", {
        /**
         * channelInterpretation determines how individual channels will be treated
         * when up-mixing and down-mixing connections to any inputs to the node.
         * The default value is "speakers".
         */
        get: function () {
            return this._getChannelProperties().channelInterpretation;
        },
        set: function (channelInterpretation) {
            var props = this._getChannelProperties();
            // merge it with the other properties
            this._setChannelProperties(Object.assign(props, { channelInterpretation: channelInterpretation }));
        },
        enumerable: true,
        configurable: true
    });
    //-------------------------------------
    // CONNECTIONS
    //-------------------------------------
    /**
     * connect the output of a ToneAudioNode to an AudioParam, AudioNode, or ToneAudioNode
     * @param destination The output to connect to
     * @param outputNum The output to connect from
     * @param inputNum The input to connect to
     */
    ToneAudioNode.prototype.connect = function (destination, outputNum, inputNum) {
        if (outputNum === void 0) { outputNum = 0; }
        if (inputNum === void 0) { inputNum = 0; }
        connect(this, destination, outputNum, inputNum);
        return this;
    };
    /**
     * Connect the output to the context's destination node.
     */
    ToneAudioNode.prototype.toDestination = function () {
        this.connect(this.context.destination);
        return this;
    };
    /**
     * Connect the output to the context's destination node.
     * See [[toDestination]]
     * @deprecated
     */
    ToneAudioNode.prototype.toMaster = function () {
        warn("toMaster() has been renamed toDestination()");
        return this.toDestination();
    };
    /**
     * disconnect the output
     */
    ToneAudioNode.prototype.disconnect = function (destination, outputNum, inputNum) {
        if (outputNum === void 0) { outputNum = 0; }
        if (inputNum === void 0) { inputNum = 0; }
        disconnect(this, destination, outputNum, inputNum);
        return this;
    };
    /**
     * Connect the output of this node to the rest of the nodes in series.
     * @example
     * import { Destination, Filter, Oscillator, Volume } from "tone";
     * const osc = new Oscillator().start();
     * const filter = new Filter();
     * const volume = new Volume(-8);
     * // connect a node to the filter, volume and then to the master output
     * osc.chain(filter, volume, Destination);
     */
    ToneAudioNode.prototype.chain = function () {
        var nodes = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            nodes[_i] = arguments[_i];
        }
        connectSeries.apply(void 0, tslib_1.__spread([this], nodes));
        return this;
    };
    /**
     * connect the output of this node to the rest of the nodes in parallel.
     */
    ToneAudioNode.prototype.fan = function () {
        var _this = this;
        var nodes = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            nodes[_i] = arguments[_i];
        }
        nodes.forEach(function (node) { return _this.connect(node); });
        return this;
    };
    /**
     * Dispose and disconnect
     */
    ToneAudioNode.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        if (isDefined(this.input)) {
            if (this.input instanceof ToneAudioNode) {
                this.input.dispose();
            }
            else if (isAudioNode(this.input)) {
                this.input.disconnect();
            }
        }
        if (isDefined(this.output)) {
            if (this.output instanceof ToneAudioNode) {
                this.output.dispose();
            }
            else if (isAudioNode(this.output)) {
                this.output.disconnect();
            }
        }
        this._internalChannels = [];
        return this;
    };
    return ToneAudioNode;
}(ToneWithContext));
export { ToneAudioNode };
//-------------------------------------
// CONNECTIONS
//-------------------------------------
/**
 * connect together all of the arguments in series
 * @param nodes
 */
export function connectSeries() {
    var nodes = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        nodes[_i] = arguments[_i];
    }
    var first = nodes.shift();
    nodes.reduce(function (prev, current) {
        if (prev instanceof ToneAudioNode) {
            prev.connect(current);
        }
        else if (isAudioNode(prev)) {
            connect(prev, current);
        }
        return current;
    }, first);
}
/**
 * Connect two nodes together so that signal flows from the
 * first node to the second. Optionally specify the input and output channels.
 * @param srcNode The source node
 * @param dstNode The destination node
 * @param outputNumber The output channel of the srcNode
 * @param inputNumber The input channel of the dstNode
 */
export function connect(srcNode, dstNode, outputNumber, inputNumber) {
    if (outputNumber === void 0) { outputNumber = 0; }
    if (inputNumber === void 0) { inputNumber = 0; }
    assert(isDefined(srcNode), "Cannot connect from undefined node");
    assert(isDefined(dstNode), "Cannot connect to undefined node");
    if (dstNode instanceof ToneAudioNode || isAudioNode(dstNode)) {
        assert(dstNode.numberOfInputs > 0, "Cannot connect to node with no inputs");
    }
    assert(srcNode.numberOfOutputs > 0, "Cannot connect from node with no outputs");
    // resolve the input of the dstNode
    while ((dstNode instanceof ToneAudioNode || dstNode instanceof Param)) {
        if (isDefined(dstNode.input)) {
            dstNode = dstNode.input;
        }
    }
    while (srcNode instanceof ToneAudioNode) {
        if (isDefined(srcNode.output)) {
            srcNode = srcNode.output;
        }
    }
    // make the connection
    if (isAudioParam(dstNode)) {
        srcNode.connect(dstNode, outputNumber);
    }
    else {
        srcNode.connect(dstNode, outputNumber, inputNumber);
    }
}
/**
 * Disconnect a node from all nodes or optionally include a destination node and input/output channels.
 * @param srcNode The source node
 * @param dstNode The destination node
 * @param outputNumber The output channel of the srcNode
 * @param inputNumber The input channel of the dstNode
 */
export function disconnect(srcNode, dstNode, outputNumber, inputNumber) {
    if (outputNumber === void 0) { outputNumber = 0; }
    if (inputNumber === void 0) { inputNumber = 0; }
    // resolve the destination node
    if (isDefined(dstNode)) {
        while (dstNode instanceof ToneAudioNode) {
            dstNode = dstNode.input;
        }
    }
    // resolve the src node
    while (!(isAudioNode(srcNode))) {
        if (isDefined(srcNode.output)) {
            srcNode = srcNode.output;
        }
    }
    if (isAudioParam(dstNode)) {
        srcNode.disconnect(dstNode, outputNumber);
    }
    else if (isAudioNode(dstNode)) {
        srcNode.disconnect(dstNode, outputNumber, inputNumber);
    }
    else {
        srcNode.disconnect();
    }
}
//# sourceMappingURL=ToneAudioNode.js.map