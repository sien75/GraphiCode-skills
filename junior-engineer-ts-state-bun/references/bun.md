# Bun Runtime Environment

This is a list of some Bun API references. When you need to use a specific API and are unsure how to use it, you can query it using the context7 MCP.

## APIs supported by Bun

| Topic | APIs |
|-------|------|
| HTTP Server | Bun.serve |
| Shell | $ |
| Bundler | Bun.build |
| File I/O | Bun.file, Bun.write, Bun.stdin, Bun.stdout, Bun.stderr |
| Child Processes | Bun.spawn, Bun.spawnSync |
| TCP Sockets | Bun.listen, Bun.connect |
| UDP Sockets | Bun.udpSocket |
| WebSockets | new WebSocket() (client), Bun.serve (server) |
| Transpiler | Bun.Transpiler |
| Routing | Bun.FileSystemRouter |
| Streaming HTML | HTMLRewriter |
| Hashing | Bun.password, Bun.hash, Bun.CryptoHasher, Bun.sha |
| SQLite | bun:sqlite |
| PostgreSQL Client | Bun.SQL, Bun.sql |
| Redis (Valkey) Client | Bun.RedisClient, Bun.redis |
| FFI (Foreign Function Interface) | bun:ffi |
| DNS | Bun.dns.lookup, Bun.dns.prefetch, Bun.dns.getCacheStats |
| Testing | bun:test |
| Workers | new Worker() |
| Module Loaders | Bun.plugin |
| Glob | Bun.Glob |
| Cookies | Bun.Cookie, Bun.CookieMap |
| Node-API | Node-API |
| import.meta | import.meta |
| Utilities | Bun.version, Bun.revision, Bun.env, Bun.main |
| Sleep & Timing | Bun.sleep(), Bun.sleepSync(), Bun.nanoseconds() |
| Random & UUID | Bun.randomUUIDv7() |
| System & Environment | Bun.which() |
| Comparison & Inspection | Bun.peek(), Bun.deepEquals(), Bun.deepMatch, Bun.inspect() |
| String & Text Processing | Bun.escapeHTML(), Bun.stringWidth(), Bun.indexOfLine |
| URL & Path Utilities | Bun.fileURLToPath(), Bun.pathToFileURL() |
| Compression | Bun.gzipSync(), Bun.gunzipSync(), Bun.deflateSync(), Bun.inflateSync(), Bun.zstdCompressSync(), Bun.zstdDecompressSync(), Bun.zstdCompress(), Bun.zstdDecompress() |
| Stream Processing | Bun.readableStreamTo*(), Bun.readableStreamToBytes(), Bun.readableStreamToBlob(), Bun.readableStreamToFormData(), Bun.readableStreamToJSON(), Bun.readableStreamToArray() |
| Memory & Buffer Management | Bun.ArrayBufferSink, Bun.allocUnsafe, Bun.concatArrayBuffers |
| Module Resolution | Bun.resolveSync() |
| Parsing & Formatting | Bun.semver, Bun.TOML.parse, Bun.markdown, Bun.color |
| Low-level / Internals | Bun.mmap, Bun.gc, Bun.generateHeapSnapshot, bun:jsc |

## Web APIs supported by Bun

| Category | APIs |
|----------|------|
| HTTP | fetch, Response, Request, Headers, AbortController, AbortSignal |
| URLs | URL, URLSearchParams |
| Web Workers | Worker, self.postMessage, structuredClone, MessagePort, MessageChannel, BroadcastChannel |
| Streams | ReadableStream, WritableStream, TransformStream, ByteLengthQueuingStrategy, CountQueuingStrategy and associated classes |
| Blob | Blob |
| WebSockets | WebSocket |
| Encoding and decoding | atob, btoa, TextEncoder, TextDecoder |
| JSON | JSON |
| Timeouts | setTimeout, clearTimeout |
| Intervals | setInterval, clearInterval |
| Crypto | crypto, SubtleCrypto, CryptoKey |
| Debugging | console, performance |
| Microtasks | queueMicrotask |
| Errors | reportError |
| User interaction | alert, confirm, prompt (intended for interactive CLIs) |
| Realms | ShadowRealm |
| Events | EventTarget, Event, ErrorEvent, CloseEvent, MessageEvent |

## Global variables supported by Bun

| Global | Source |
|--------|--------|
| AbortController | Web |
| AbortSignal | Web |
| alert | Web |
| Blob | Web |
| Buffer | Node.js |
| Bun | Bun |
| ByteLengthQueuingStrategy | Web |
| confirm | Web |
| __dirname | Node.js |
| __filename | Node.js |
| atob() | Web |
| btoa() | Web |
| BuildMessage | Bun |
| clearImmediate() | Web |
| clearInterval() | Web |
| clearTimeout() | Web |
| console | Web |
| CountQueuingStrategy | Web |
| Crypto | Web |
| crypto | Web |
| CryptoKey | Web |
| CustomEvent | Web |
| Event | Web |
| EventTarget | Web |
| exports | Node.js |
| fetch | Web |
| FormData | Web |
| global | Node.js |
| globalThis | Cross-platform |
| Headers | Web |
| HTMLRewriter | Cloudflare |
| JSON | Web |
| MessageEvent | Web |
| module | Node.js |
| performance | Web |
| process | Node.js |
| prompt | Web |
| queueMicrotask() | Web |
| ReadableByteStreamController | Web |
| ReadableStream | Web |
| ReadableStreamDefaultController | Web |
| ReadableStreamDefaultReader | Web |
| reportError | Web |
| require() | Node.js |
| ResolveMessage | Bun |
| Response | Web |
| Request | Web |
| setImmediate() | Web |
| setInterval() | Web |
| setTimeout() | Web |
| ShadowRealm | Web |
| SubtleCrypto | Web |
| DOMException | Web |
| TextDecoder | Web |
| TextEncoder | Web |
| TransformStream | Web |
| TransformStreamDefaultController | Web |
| URL | Web |
| URLSearchParams | Web |
| WebAssembly | Web |
| WritableStream | Web |
| WritableStreamDefaultController | Web |
| WritableStreamDefaultWriter | Web |
