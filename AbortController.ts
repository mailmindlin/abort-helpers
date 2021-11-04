//TODO: EventTarget polyfill?

let $AbortController: typeof AbortController = AbortController;
type $AbortController = AbortController;
let $AbortSignal: typeof AbortSignal = AbortSignal;
type $AbortSignal = AbortSignal;

if (!$AbortController) {
	function setProp<T extends object, K extends keyof T>(base: T, key: K, value: T[K]) {
		Object.defineProperty(base, key, { value, writable: true, configurable: true });
		return value;
	}
	
	/** Polyfill for AbortSignal */
	class AbortSignalPoly extends EventTarget implements AbortSignal {
		/** Returns an AbortSignal instance whose aborted flag is set. */
		static abort() {
			const controller = new AbortControllerPoly();
			controller.abort();
			return controller.signal;
		}
		
		/** Returns true if this AbortSignal's AbortController has signaled to abort; otherwise false */
		declare aborted: boolean;
		declare onabort: ((this: AbortSignal, ev: Event) => any) | null;
		
		constructor() {
			super();
			
			setProp(this, 'aborted', false);
			setProp(this, 'onabort', null);
		}
		
		override dispatchEvent(e: Event) {
			if (e.type === 'abort') {
				this.aborted = true;
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
		static aborted() {
			const result = new AbortControllerPoly();
			result.abort();
			return result;
		}
		
		get signal(): AbortSignal {
			return setProp(this, 'signal', new AbortSignalPoly());
		}
		abort() {
			const signal = this.signal;
			if (signal.aborted)
				return;
			let event: Event;
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
	$AbortSignal = AbortSignal;
}


export {
	$AbortController as AbortController,
	$AbortSignal as AbortSignal,
	$AbortSignal,
	$AbortController,
};

export default $AbortController;