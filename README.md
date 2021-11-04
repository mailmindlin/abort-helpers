# abort-helpers

This includes a polyfill for [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController), and also some utilities

## AbortError

You can use AbortError like a generic error emitted from an AbortController. This should even work for `DOMException`s.

```
try {
	checkAbort(AbortSignal.abort());
} catch (e) {
	if (e instanceof AbortError) {
		// true
	}
}
```