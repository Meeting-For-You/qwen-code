/**
 * @license
 * Copyright 2025 Alibaba Group Holding Limited. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0
 */
import type { DaemonSessionPrInfo } from './types.js';
/** Upper bound for a bound PR URL; generous for enterprise hosts + long paths. */
export declare const MAX_SESSION_PR_URL_LENGTH = 2048;
/**
 * Runtime guard for a session PR binding received from the daemon. The url
 * is rendered as a link target, so only http(s) URLs are accepted.
 */
export declare function isDaemonSessionPrInfo(value: unknown): value is DaemonSessionPrInfo;
