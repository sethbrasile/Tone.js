/**
 * A class which provides a reliable callback using either
 * a Web Worker, or if that isn't supported, falls back to setTimeout.
 */
var Ticker = /** @class */ (function () {
    function Ticker(callback, type, updateInterval) {
        this._callback = callback;
        this._type = type;
        this._updateInterval = updateInterval;
        // create the clock source for the first time
        this._createClock();
    }
    /**
     * Generate a web worker
     */
    Ticker.prototype._createWorker = function () {
        var blob = new Blob([
            /* javascript */ "\n\t\t\t// the initial timeout time\n\t\t\tlet timeoutTime =  " + (this._updateInterval * 1000).toFixed(1) + ";\n\t\t\t// onmessage callback\n\t\t\tself.onmessage = function(msg){\n\t\t\t\ttimeoutTime = parseInt(msg.data);\n\t\t\t};\n\t\t\t// the tick function which posts a message\n\t\t\t// and schedules a new tick\n\t\t\tfunction tick(){\n\t\t\t\tsetTimeout(tick, timeoutTime);\n\t\t\t\tself.postMessage('tick');\n\t\t\t}\n\t\t\t// call tick initially\n\t\t\ttick();\n\t\t\t"
        ], { type: "text/javascript" });
        var blobUrl = URL.createObjectURL(blob);
        var worker = new Worker(blobUrl);
        worker.onmessage = this._callback.bind(this);
        this._worker = worker;
    };
    /**
     * Create a timeout loop
     */
    Ticker.prototype._createTimeout = function () {
        var _this = this;
        this._timeout = setTimeout(function () {
            _this._createTimeout();
            _this._callback();
        }, this._updateInterval * 1000);
    };
    /**
     * Create the clock source.
     */
    Ticker.prototype._createClock = function () {
        if (this._type === "worker") {
            try {
                this._createWorker();
            }
            catch (e) {
                // workers not supported, fallback to timeout
                this._type = "timeout";
                this._createClock();
            }
        }
        else if (this._type === "timeout") {
            this._createTimeout();
        }
    };
    /**
     * Clean up the current clock source
     */
    Ticker.prototype._disposeClock = function () {
        if (this._timeout) {
            clearTimeout(this._timeout);
            this._timeout = 0;
        }
        if (this._worker) {
            this._worker.terminate();
            this._worker.onmessage = null;
        }
    };
    Object.defineProperty(Ticker.prototype, "updateInterval", {
        /**
         * The rate in seconds the ticker will update
         */
        get: function () {
            return this._updateInterval;
        },
        set: function (interval) {
            this._updateInterval = Math.max(interval, 128 / 44100);
            if (this._type === "worker") {
                this._worker.postMessage(Math.max(interval * 1000, 1));
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Ticker.prototype, "type", {
        /**
         * The type of the ticker, either a worker or a timeout
         */
        get: function () {
            return this._type;
        },
        set: function (type) {
            this._disposeClock();
            this._type = type;
            this._createClock();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Clean up
     */
    Ticker.prototype.dispose = function () {
        this._disposeClock();
    };
    return Ticker;
}());
export { Ticker };
//# sourceMappingURL=Ticker.js.map