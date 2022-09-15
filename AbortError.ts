

interface AbortError extends Error {
	readonly message: string;
}

interface AbortErrorConstructor {
	new (message?: string): AbortError;
}

type IAbortError = AbortError;

const AbortError = (() => {
	class AbortError extends Error implements IAbortError {
		constructor(message: string) {
			super(message);
		}
	}
	
	function AbortErrorDispatch(message: string = 'signal is aborted without reason') {
		if (typeof new.target === undefined)
			throw new TypeError(`Failed to construct 'AbortError': Please use the 'new' operator, this constructor cannot be called as a function.`);
		
		if (typeof DOMException !== 'undefined') {
			// Use DOMException constructor, if present
			try {
				return new DOMException(message, 'AbortError');
			} catch (e) {
				if (!(e instanceof TypeError))
					throw e;
				// IE throws TypeError here
			}
		}
		
		return new AbortError(message);
	}
	
	try {
		Object.defineProperty(AbortErrorDispatch, Symbol.hasInstance, {
			enumerable: false,
			value: function isAbortError(value: unknown): boolean {
				return (value instanceof AbortError) || ((typeof DOMException !== 'undefined') && (value instanceof DOMException) && (value.message === 'AbortError' || value.code === 20));
			}
		})
	} catch { /* swallow */}
	
	return AbortErrorDispatch as any as AbortErrorConstructor;
})();

export default AbortError;