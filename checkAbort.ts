import AbortError from './AbortError';

/**
 * Check that the signal (if present) hasn't been aborted
 * @param signal 
 * @deprecated Prefer `AbortSignal.throwIfAborted()`
 */
 export default function checkAbort(signal: AbortSignal | undefined) {
    if (signal !== undefined && signal.aborted)
        //TODO: DOMException compat?
        throw new AbortError();
}