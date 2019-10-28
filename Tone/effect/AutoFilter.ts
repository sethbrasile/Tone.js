import { Effect, EffectOptions } from "../effect/Effect";
import { Frequency, NormalRange, Positive, Time } from "../core/type/Units";
import { Filter, FilterOptions } from "../component/filter/Filter";
import { SourceOptions } from "../source/Source";
import { optionsFromArguments } from "../core/util/Defaults";
import { LFOEffect, LFOEffectOptions } from "./LFOEffect";

export interface AutoFilterOptions extends LFOEffectOptions {
	baseFrequency: Frequency;
	octaves: Positive;
	filter: Omit<FilterOptions, keyof SourceOptions | "frequency" | "detune" | "gain">;
}

/**
 * AutoFilter is a Tone.Filter with a Tone.LFO connected to the filter cutoff frequency.
 * Setting the LFO rate and depth allows for control over the filter modulation rate 
 * and depth.
 *
 * @example
 * import { AutoFilter, Oscillator } from "tone";
 * // create an autofilter and start it's LFO
 * const autoFilter = new AutoFilter("4n").toDestination().start();
 * // route an oscillator through the filter and start it
 * const oscillator = new Oscillator().connect(autoFilter).start();
 */
export class AutoFilter extends LFOEffect<AutoFilterOptions> {

	readonly name: string = "AutoFilter";

	/**
	 * The filter node
	 */
	readonly filter: Filter;
	
	/**
	 * The octaves placeholder
	 */
	private _octaves!: Positive;

	/**
	 * @param frequency The rate of the LFO.
	 * @param baseFrequency The lower value of the LFOs oscillation
	 * @param octaves The number of octaves above the baseFrequency
	 */
	constructor(frequency?: Frequency, baseFrequency?: Frequency, octaves?: Positive);
	constructor(options?: Partial<AutoFilterOptions>);
	constructor() {

		super(optionsFromArguments(AutoFilter.getDefaults(), arguments, ["frequency", "baseFrequency", "octaves"]));
		const options = optionsFromArguments(AutoFilter.getDefaults(), arguments, ["frequency", "baseFrequency", "octaves"]);

		this.filter = new Filter(Object.assign(options.filter, {
			context: this.context,
		}));

		// connections
		this.connectEffect(this.filter);
		this._lfo.connect(this.filter.frequency);
		this.octaves = options.octaves;
		this.baseFrequency = options.baseFrequency;
	}

	static getDefaults(): AutoFilterOptions {
		return Object.assign(LFOEffect.getDefaults(), {
			baseFrequency: 200,
			octaves: 2.6,
			filter: {
				type: "lowpass" as "lowpass",
				rolloff: -12 as -12,
				Q: 1,
			}
		});
	}

	/**
	 * The minimum value of the filter's cutoff frequency.
	 */
	get baseFrequency(): Frequency {
		return this._lfo.min;
	}
	set baseFrequency(freq) {
		this._lfo.min = this.toFrequency(freq);
		// and set the max
		this.octaves = this._octaves;
	}

	/**
	 * The maximum value of the filter's cutoff frequency. 
	 */
	get octaves(): Positive {
		return this._octaves;
	}
	set octaves(oct) {
		this._octaves = oct;
		this._lfo.max = this._lfo.min * Math.pow(2, oct);
	}

	dispose(): this {
		super.dispose();
		this.filter.dispose();
		return this;
	}
}
