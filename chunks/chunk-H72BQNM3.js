// Force strict mode and setup for ESM
"use strict";
import {
  init_esbuild_shims
} from "./chunk-5O2XNYP6.js";
import {
  __name
} from "./chunk-J2S4EL5Y.js";

// packages/acp-bridge/src/ndJsonStream.ts
init_esbuild_shims();
import { createHash } from "node:crypto";
import { inspect } from "node:util";
var NdJsonFrameTooLargeError = class extends Error {
  constructor(direction, limitBytes, observedBytes) {
    super(
      `NDJSON ${direction} frame exceeds ${limitBytes} bytes (observed ${observedBytes} bytes)`
    );
    this.direction = direction;
    this.limitBytes = limitBytes;
    this.observedBytes = observedBytes;
    this.name = "NdJsonFrameTooLargeError";
  }
  static {
    __name(this, "NdJsonFrameTooLargeError");
  }
  code = "ndjson_frame_too_large";
};
var NdJsonQueueLimitError = class extends Error {
  constructor(maxQueuedMessages, maxQueuedBytes, requiredBytes, availableBytes) {
    super(
      `NDJSON decoded queue is full (required ${requiredBytes} bytes, available ${availableBytes} bytes)`
    );
    this.maxQueuedMessages = maxQueuedMessages;
    this.maxQueuedBytes = maxQueuedBytes;
    this.requiredBytes = requiredBytes;
    this.availableBytes = availableBytes;
    this.name = "NdJsonQueueLimitError";
  }
  static {
    __name(this, "NdJsonQueueLimitError");
  }
  code = "ndjson_queue_limit_exceeded";
};
var NdJsonIncompleteFrameError = class extends Error {
  constructor(observedBytes) {
    super(`NDJSON input ended with an incomplete ${observedBytes}-byte frame`);
    this.observedBytes = observedBytes;
    this.name = "NdJsonIncompleteFrameError";
  }
  static {
    __name(this, "NdJsonIncompleteFrameError");
  }
  code = "ndjson_incomplete_frame";
};
var NdJsonUnexpectedEofError = class extends Error {
  static {
    __name(this, "NdJsonUnexpectedEofError");
  }
  code = "ndjson_unexpected_eof";
  constructor() {
    super("NDJSON input ended while the bounded transport was active");
    this.name = "NdJsonUnexpectedEofError";
  }
};
var NdJsonInvalidMessageError = class extends Error {
  constructor(code, observedBytes) {
    super(`NDJSON input contains an invalid ${observedBytes}-byte message`);
    this.code = code;
    this.observedBytes = observedBytes;
    this.name = "NdJsonInvalidMessageError";
  }
  static {
    __name(this, "NdJsonInvalidMessageError");
  }
};
var MAX_JSON_RPC_METHOD_BYTES = 1024;
var MAX_JSON_RPC_ID_BYTES = 256;
var MAX_JSON_RPC_ERROR_MESSAGE_BYTES = 1024;
var MAX_JSON_DEPTH = 64;
var MAX_JSON_NODES = 1e4;
var MAX_JSON_ARRAY_LENGTH = 4096;
function ndJsonStream(output, input, hooks, limits, validateInboundMessage, fatalCleanEof = false) {
  const textEncoder = new TextEncoder();
  const textDecoder = new TextDecoder();
  if (limits) validateNdJsonStreamLimits(limits);
  const outboundRequests = limits ? new BoundedOutstandingRequestLedger(limits) : void 0;
  const inboundRequests = limits ? new BoundedInboundRequestLedger(limits) : void 0;
  const readable = limits ? createBoundedReadable(
    input,
    textDecoder,
    hooks,
    limits,
    outboundRequests,
    inboundRequests,
    validateInboundMessage,
    fatalCleanEof
  ) : createLegacyReadable(input, textDecoder, hooks);
  const writable = new WritableStream({
    async write(message) {
      let writer;
      let expectedResponseId;
      try {
        const content = JSON.stringify(message);
        const payload = textEncoder.encode(content);
        const frameBytes = payload.byteLength + 1;
        if (limits && frameBytes > limits.maxFrameBytes) {
          throw new NdJsonFrameTooLargeError(
            "sent",
            limits.maxFrameBytes,
            frameBytes
          );
        }
        const frame = new Uint8Array(frameBytes);
        frame.set(payload);
        frame[payload.byteLength] = 10;
        if (outboundRequests && isJsonRpcRequestMessage(message)) {
          outboundRequests.admit(message.id, frameBytes);
          expectedResponseId = message.id;
        }
        writer = output.getWriter();
        await writer.write(frame);
        inboundRequests?.release(message);
        callHook(hooks?.onMessageSent, payload.byteLength);
        callHook(hooks?.onMessageObserved, {
          direction: "sent",
          bytes: payload.byteLength,
          message
        });
      } catch (error) {
        if (expectedResponseId !== void 0) {
          outboundRequests?.discard(expectedResponseId);
        }
        if (limits) callHook(hooks?.onTransportError, error);
        throw error;
      } finally {
        writer?.releaseLock();
      }
    }
  });
  return { readable, writable };
}
__name(ndJsonStream, "ndJsonStream");
function createLegacyReadable(input, textDecoder, hooks) {
  return new ReadableStream({
    async start(controller) {
      const pending = [];
      const reader = input.getReader();
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (!value) continue;
          readLegacyChunk(value, pending, controller, textDecoder, hooks);
        }
      } finally {
        reader.releaseLock();
        controller.close();
      }
    }
  });
}
__name(createLegacyReadable, "createLegacyReadable");
function createBoundedReadable(input, textDecoder, hooks, limits, outboundRequests, inboundRequests, validateInboundMessage, fatalCleanEof) {
  const pending = new BoundedFrameBuffer(limits.maxFrameBytes);
  const minimumQueueCharge = Math.ceil(
    limits.maxQueuedBytes / limits.maxQueuedMessages
  );
  let nextQueueCharge = minimumQueueCharge;
  let reader;
  let canceled = false;
  return new ReadableStream(
    {
      start(controller) {
        reader = input.getReader();
        void pumpBoundedInput(
          reader,
          pending,
          controller,
          textDecoder,
          hooks,
          limits,
          outboundRequests,
          inboundRequests,
          validateInboundMessage,
          fatalCleanEof,
          minimumQueueCharge,
          (charge) => {
            nextQueueCharge = charge;
          },
          () => canceled
        );
      },
      async cancel(reason) {
        canceled = true;
        pending.clear();
        if (reader) await cancelReader(reader, reason);
      }
    },
    {
      highWaterMark: limits.maxQueuedBytes,
      size: /* @__PURE__ */ __name(() => nextQueueCharge, "size")
    }
  );
}
__name(createBoundedReadable, "createBoundedReadable");
async function pumpBoundedInput(reader, pending, controller, textDecoder, hooks, limits, outboundRequests, inboundRequests, validateInboundMessage, fatalCleanEof, minimumQueueCharge, setNextQueueCharge, isCanceled) {
  try {
    while (true) {
      const result = await reader.read();
      if (result.done) {
        if (isCanceled()) return;
        if (pending.byteLength > 0) {
          throw new NdJsonIncompleteFrameError(pending.byteLength);
        }
        if (fatalCleanEof) throw new NdJsonUnexpectedEofError();
        controller.close();
        return;
      }
      if (!result.value) continue;
      readBoundedChunk(
        result.value,
        pending,
        controller,
        textDecoder,
        hooks,
        limits,
        outboundRequests,
        inboundRequests,
        validateInboundMessage,
        minimumQueueCharge,
        setNextQueueCharge
      );
    }
  } catch (error) {
    if (isCanceled()) return;
    pending.clear();
    callHook(hooks?.onTransportError, error);
    await cancelReader(reader, error);
    if (!isCanceled()) controller.close();
  } finally {
    pending.clear();
    outboundRequests.clear();
    inboundRequests.clear();
    reader.releaseLock();
  }
}
__name(pumpBoundedInput, "pumpBoundedInput");
function readLegacyChunk(chunk, pending, controller, textDecoder, hooks) {
  let start = 0;
  let newline = chunk.indexOf(10, start);
  while (newline !== -1) {
    const lineBytes = takeLegacyLineBytes(
      pending,
      chunk.subarray(start, newline)
    );
    handleLegacyLine(lineBytes, controller, textDecoder, hooks);
    start = newline + 1;
    newline = chunk.indexOf(10, start);
  }
  if (start < chunk.length) {
    pending.push(chunk.subarray(start));
  }
}
__name(readLegacyChunk, "readLegacyChunk");
function readBoundedChunk(chunk, pending, controller, textDecoder, hooks, limits, outboundRequests, inboundRequests, validateInboundMessage, minimumQueueCharge, setNextQueueCharge) {
  let start = 0;
  let newline = chunk.indexOf(10, start);
  while (newline !== -1) {
    const current = chunk.subarray(start, newline);
    const frameBytes = pending.byteLength + current.byteLength + 1;
    assertFrameSize("received", limits.maxFrameBytes, frameBytes);
    if (pending.isJsonWhitespaceLine(current)) {
      pending.clear();
      start = newline + 1;
      newline = chunk.indexOf(10, start);
      continue;
    }
    const queueCharge = Math.max(frameBytes, minimumQueueCharge);
    const availableBytes = controller.desiredSize;
    if (availableBytes === null || queueCharge > availableBytes) {
      throw new NdJsonQueueLimitError(
        limits.maxQueuedMessages,
        limits.maxQueuedBytes,
        queueCharge,
        Math.max(0, availableBytes ?? 0)
      );
    }
    setNextQueueCharge(queueCharge);
    handleBoundedLine(
      pending.take(current),
      controller,
      textDecoder,
      hooks,
      outboundRequests,
      inboundRequests,
      validateInboundMessage
    );
    start = newline + 1;
    newline = chunk.indexOf(10, start);
  }
  if (start < chunk.length) pending.append(chunk.subarray(start));
}
__name(readBoundedChunk, "readBoundedChunk");
function takeLegacyLineBytes(pending, current) {
  if (pending.length === 0) return current;
  const totalLength = pending.reduce((sum, part) => sum + part.byteLength, 0) + current.byteLength;
  const line = new Uint8Array(totalLength);
  let offset = 0;
  for (const part of pending) {
    line.set(part, offset);
    offset += part.byteLength;
  }
  line.set(current, offset);
  pending.length = 0;
  return line;
}
__name(takeLegacyLineBytes, "takeLegacyLineBytes");
function handleLegacyLine(lineBytes, controller, textDecoder, hooks) {
  const line = textDecoder.decode(lineBytes);
  const trimmedLine = line.trim();
  if (!trimmedLine) return;
  try {
    const message = JSON.parse(trimmedLine);
    controller.enqueue(message);
    reportReceivedMessage(lineBytes, message, hooks);
  } catch (err) {
    console.error("Failed to parse JSON message:", trimmedLine, err);
  }
}
__name(handleLegacyLine, "handleLegacyLine");
function handleBoundedLine(lineBytes, controller, textDecoder, hooks, outboundRequests, inboundRequests, validateInboundMessage) {
  const line = textDecoder.decode(lineBytes);
  const trimmedLine = line.trim();
  if (!trimmedLine) return;
  let parsed;
  try {
    parsed = JSON.parse(trimmedLine);
  } catch {
    throw logBoundedInvalidMessage("ndjson_parse_error", lineBytes);
  }
  if (!isJsonRpcMessage(parsed)) {
    throw logBoundedInvalidMessage("ndjson_invalid_message", lineBytes);
  }
  const isResponse = isJsonRpcResponseMessage(parsed);
  if (!isResponse && !hasBoundedJsonStructure(parsed) || validateInboundMessage && !validateInboundMessage(parsed)) {
    throw logBoundedInvalidMessage("ndjson_invalid_message", lineBytes);
  }
  if (isJsonRpcResponseMessage(parsed) && !outboundRequests?.consumeResponse(parsed.id)) {
    throw logBoundedInvalidMessage("ndjson_invalid_message", lineBytes);
  }
  inboundRequests?.admit(parsed, lineBytes.byteLength + 1);
  const message = installBoundedLogRedaction(parsed);
  controller.enqueue(message);
  reportReceivedMessage(lineBytes, message, hooks);
}
__name(handleBoundedLine, "handleBoundedLine");
function installBoundedLogRedaction(message) {
  Object.defineProperty(message, inspect.custom, {
    configurable: false,
    enumerable: false,
    value: inspectBoundedJsonRpcMessage,
    writable: false
  });
  return message;
}
__name(installBoundedLogRedaction, "installBoundedLogRedaction");
function inspectBoundedJsonRpcMessage() {
  return {
    jsonrpc: "2.0",
    messageType: "method" in this ? "id" in this ? "request" : "notification" : "response",
    payloadOmitted: true
  };
}
__name(inspectBoundedJsonRpcMessage, "inspectBoundedJsonRpcMessage");
function isJsonRpcMessage(value) {
  if (!isRecord(value) || value["jsonrpc"] !== "2.0") return false;
  const hasMethod = Object.hasOwn(value, "method");
  const hasId = Object.hasOwn(value, "id");
  if (hasMethod) {
    return typeof value["method"] === "string" && Buffer.byteLength(value["method"]) <= MAX_JSON_RPC_METHOD_BYTES && (!hasId || isJsonRpcId(value["id"]));
  }
  if (!hasId || !isJsonRpcId(value["id"])) return false;
  const hasResult = Object.hasOwn(value, "result");
  const hasError = Object.hasOwn(value, "error");
  if (hasResult === hasError) return false;
  if (!hasError) return true;
  const error = value["error"];
  return isRecord(error) && typeof error["code"] === "number" && Number.isFinite(error["code"]) && typeof error["message"] === "string" && Buffer.byteLength(error["message"]) <= MAX_JSON_RPC_ERROR_MESSAGE_BYTES;
}
__name(isJsonRpcMessage, "isJsonRpcMessage");
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
__name(isRecord, "isRecord");
function hasBoundedJsonStructure(value) {
  const stack = [{ value, depth: 1 }];
  let nodes = 0;
  while (stack.length > 0) {
    const current = stack.pop();
    nodes++;
    if (nodes > MAX_JSON_NODES || current.depth > MAX_JSON_DEPTH) return false;
    if (Array.isArray(current.value)) {
      if (current.value.length > MAX_JSON_ARRAY_LENGTH) return false;
      for (let index = current.value.length - 1; index >= 0; index--) {
        if (nodes + stack.length >= MAX_JSON_NODES || current.depth + 1 > MAX_JSON_DEPTH) {
          return false;
        }
        stack.push({
          value: current.value[index],
          depth: current.depth + 1
        });
      }
    } else if (isRecord(current.value)) {
      for (const key in current.value) {
        if (!Object.hasOwn(current.value, key)) continue;
        if (nodes + stack.length >= MAX_JSON_NODES || current.depth + 1 > MAX_JSON_DEPTH) {
          return false;
        }
        stack.push({
          value: current.value[key],
          depth: current.depth + 1
        });
      }
    }
  }
  return true;
}
__name(hasBoundedJsonStructure, "hasBoundedJsonStructure");
function isJsonRpcId(value) {
  return value === null || typeof value === "string" && Buffer.byteLength(value) <= MAX_JSON_RPC_ID_BYTES || typeof value === "number" && Number.isFinite(value);
}
__name(isJsonRpcId, "isJsonRpcId");
function isJsonRpcRequestMessage(value) {
  return "method" in value && "id" in value && typeof value.method === "string" && isJsonRpcId(value.id);
}
__name(isJsonRpcRequestMessage, "isJsonRpcRequestMessage");
function isJsonRpcResponseMessage(value) {
  return !("method" in value) && "id" in value;
}
__name(isJsonRpcResponseMessage, "isJsonRpcResponseMessage");
var BoundedInboundRequestLedger = class {
  constructor(limits) {
    this.limits = limits;
  }
  static {
    __name(this, "BoundedInboundRequestLedger");
  }
  requests = /* @__PURE__ */ new Map();
  retainedBytes = 0;
  admit(message, frameBytes) {
    if (!isJsonRpcRequestMessage(message)) return;
    const availableBytes = Math.max(
      0,
      this.limits.maxQueuedBytes - this.retainedBytes
    );
    if (this.requests.has(message.id) || this.requests.size >= this.limits.maxQueuedMessages || frameBytes > availableBytes) {
      throw new NdJsonQueueLimitError(
        this.limits.maxQueuedMessages,
        this.limits.maxQueuedBytes,
        frameBytes,
        this.requests.has(message.id) ? 0 : availableBytes
      );
    }
    this.requests.set(message.id, frameBytes);
    this.retainedBytes += frameBytes;
  }
  release(message) {
    if (!isJsonRpcResponseMessage(message)) return;
    const frameBytes = this.requests.get(message.id);
    if (frameBytes === void 0) return;
    this.requests.delete(message.id);
    this.retainedBytes -= frameBytes;
  }
  clear() {
    this.requests.clear();
    this.retainedBytes = 0;
  }
};
var BoundedOutstandingRequestLedger = class {
  constructor(limits) {
    this.limits = limits;
  }
  static {
    __name(this, "BoundedOutstandingRequestLedger");
  }
  requests = /* @__PURE__ */ new Map();
  retainedBytes = 0;
  admit(id, frameBytes) {
    const availableBytes = Math.max(
      0,
      this.limits.maxQueuedBytes - this.retainedBytes
    );
    if (this.requests.has(id) || this.requests.size >= this.limits.maxQueuedMessages || frameBytes > availableBytes) {
      throw new NdJsonQueueLimitError(
        this.limits.maxQueuedMessages,
        this.limits.maxQueuedBytes,
        frameBytes,
        this.requests.has(id) ? 0 : availableBytes
      );
    }
    this.requests.set(id, frameBytes);
    this.retainedBytes += frameBytes;
  }
  consumeResponse(id) {
    return this.discard(id);
  }
  discard(id) {
    const frameBytes = this.requests.get(id);
    if (frameBytes === void 0) return false;
    this.requests.delete(id);
    this.retainedBytes -= frameBytes;
    return true;
  }
  clear() {
    this.requests.clear();
    this.retainedBytes = 0;
  }
};
function logBoundedInvalidMessage(errorKind, lineBytes) {
  const bytes = jsonPayloadByteLength(lineBytes);
  const digest = createHash("sha256").update(lineBytes.subarray(0, bytes)).digest("hex");
  console.error("Failed to parse JSON message:", {
    errorKind,
    bytes,
    sha256: digest,
    payloadOmitted: true
  });
  return new NdJsonInvalidMessageError(errorKind, bytes);
}
__name(logBoundedInvalidMessage, "logBoundedInvalidMessage");
function reportReceivedMessage(lineBytes, message, hooks) {
  const bytes = jsonPayloadByteLength(lineBytes);
  callHook(hooks?.onMessageReceived, bytes);
  callHook(hooks?.onMessageObserved, {
    direction: "received",
    bytes,
    message
  });
}
__name(reportReceivedMessage, "reportReceivedMessage");
function jsonPayloadByteLength(lineBytes) {
  return lineBytes[lineBytes.byteLength - 1] === 13 ? lineBytes.byteLength - 1 : lineBytes.byteLength;
}
__name(jsonPayloadByteLength, "jsonPayloadByteLength");
function validateNdJsonStreamLimits(limits) {
  const values = [
    ["maxFrameBytes", limits.maxFrameBytes],
    ["maxQueuedMessages", limits.maxQueuedMessages],
    ["maxQueuedBytes", limits.maxQueuedBytes]
  ];
  for (const [name, value] of values) {
    if (!Number.isSafeInteger(value) || value <= 0) {
      throw new RangeError(`${name} must be a positive safe integer`);
    }
  }
}
__name(validateNdJsonStreamLimits, "validateNdJsonStreamLimits");
function assertFrameSize(direction, limitBytes, observedBytes) {
  if (observedBytes > limitBytes) {
    throw new NdJsonFrameTooLargeError(direction, limitBytes, observedBytes);
  }
}
__name(assertFrameSize, "assertFrameSize");
async function cancelReader(reader, reason) {
  try {
    await reader.cancel(reason);
  } catch {
  }
}
__name(cancelReader, "cancelReader");
function callHook(hook, value) {
  try {
    hook?.(value);
  } catch {
  }
}
__name(callHook, "callHook");
var BoundedFrameBuffer = class {
  constructor(maxFrameBytes) {
    this.maxFrameBytes = maxFrameBytes;
  }
  static {
    __name(this, "BoundedFrameBuffer");
  }
  buffer;
  length = 0;
  get byteLength() {
    return this.length;
  }
  append(bytes) {
    const requiredBytes = this.length + bytes.byteLength;
    assertFrameSize("received", this.maxFrameBytes, requiredBytes);
    if (requiredBytes === 0) return;
    if (!this.buffer || this.buffer.byteLength < requiredBytes) {
      const doubledCapacity = Math.min(
        this.maxFrameBytes,
        Math.max(1024, (this.buffer?.byteLength ?? 0) * 2)
      );
      const next = new Uint8Array(Math.max(requiredBytes, doubledCapacity));
      if (this.buffer) next.set(this.buffer.subarray(0, this.length));
      this.buffer = next;
    }
    this.buffer.set(bytes, this.length);
    this.length = requiredBytes;
  }
  take(current) {
    if (this.length === 0) return current;
    const line = new Uint8Array(this.length + current.byteLength);
    line.set(this.buffer.subarray(0, this.length));
    line.set(current, this.length);
    this.clear();
    return line;
  }
  isJsonWhitespaceLine(current) {
    if (this.buffer) {
      for (let index = 0; index < this.length; index++) {
        if (!isJsonWhitespaceByte(this.buffer[index])) return false;
      }
    }
    for (const byte of current) {
      if (!isJsonWhitespaceByte(byte)) return false;
    }
    return true;
  }
  clear() {
    this.buffer = void 0;
    this.length = 0;
  }
};
function isJsonWhitespaceByte(byte) {
  return byte === 32 || byte === 9 || byte === 13;
}
__name(isJsonWhitespaceByte, "isJsonWhitespaceByte");

export {
  NdJsonQueueLimitError,
  ndJsonStream,
  validateNdJsonStreamLimits
};
/**
 * @license
 * Copyright 2026 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
