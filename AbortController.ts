//TODO: EventTarget polyfill?

import AbortError from "./AbortError";

// TypeScript is missing abort()
type AbortSignalStatic = typeof AbortSignal & { abort(): AbortSignal };

let $AbortController: typeof AbortController = AbortController;
type $AbortController = AbortController;
let $AbortSignal: AbortSignalStatic = AbortSignal as any;
type $AbortSignal = AbortSignal;

if (!$AbortController) {
	function setProp<T extends object, K extends keyof T>(base: T, key: K, value: T[K], writable: boolean = false) {
		Object.defineProperty(base, key, { value, writable, configurable: true, enumerable: false });
		return value;
	}
	
	/** Polyfill for AbortSignal */
	class AbortSignalPoly extends EventTarget implements AbortSignal {
		/** Returns an AbortSignal instance whose aborted flag is set. */
		static abort(reason?: any) {
			return AbortControllerPoly.aborted(reason).signal;
		}
		
		declare readonly reason: any;
		declare onabort: ((this: AbortSignal, ev: Event) => any) | null;
		
		constructor() {
			super();
			
			setProp(this, 'reason', undefined);
			setProp(this, 'onabort', null, true);
		}
		/** Returns true if this AbortSignal's AbortController has signaled to abort; otherwise false */
		get aborted() {
			return this.reason !== undefined;
		}

		throwIfAborted(): void | never {
			if (this.aborted)
				throw this.reason;
		}
		
		override dispatchEvent(e: Event) {
			if (e.type === 'abort') {
				if (!this.aborted)
					setProp(this, 'reason', new AbortError())
				if (typeof this.onabort === 'function')
					this.onabort(e);
			}
			return super.dispatchEvent(e);
		}
		override toString() {
			return '[object AbortSignal]';
		}
	}
	
	class AbortControllerPoly implements AbortController {
		static aborted(reason?: any) {
			const result = new AbortControllerPoly();
			result.abort(reason);
			return result;
		}
		
		get signal(): AbortSignal {
			return setProp(this, 'signal', new AbortSignalPoly());
		}
		abort(reason?: any) {
			const signal = this.signal;
			if (signal.aborted)
				return;
			let event: Event;
			setProp(signal, 'reason', reason !== undefined ? reason : new AbortError());
			try {
				event = new Event('abort');
			} catch (e) {
				if (typeof document !== 'undefined') {
					if (!document.createEvent) {
						// For Internet Explorer 8:
						event = (document as any).createEventObject();
						setProp(event, 'type', 'abort');
					} else {
						// For Internet Explorer 11:
						event = document.createEvent('Event');
						event.initEvent('abort', false, false);
					}
				} else {
					// Fallback where document isn't available:
					//TODO: is there a better way?
					event = {
						type: 'abort',
						bubbles: false,
						cancelable: false,
					} as Event;
				}
			}
			this.signal.dispatchEvent(event);
		}
		toString() {
			return '[object AbortController]'
		}
	}
	
	$AbortController = AbortControllerPoly;
	$AbortSignal = AbortSignalPoly;
}


export {
	$AbortController as AbortController,
	$AbortSignal as AbortSignal,
	$AbortSignal,
	$AbortController,
};

export default $AbortController;