import AbortError from './AbortError';

/**
 * Check that the signal (if present) hasn't been aborted
 * @param signal 
 */
 export default function checkAbort(signal: AbortSignal | undefined) {
    if (signal !== undefined && signal.aborted)
        //TODO: DOMException compat?
        throw new AbortError();
}