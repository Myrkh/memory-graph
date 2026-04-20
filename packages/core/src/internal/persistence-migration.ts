/**
 * Forward migration of persisted payloads.
 *
 * The serialized shape on disk grows over time (annotations land in v2, etc.).
 * This module is the single place that knows how to read *any* past shape and
 * return the current one. Keep the `v0 → v1 → … → current` chain intact — no
 * reaching across versions.
 */

import { CURRENT_SCHEMA_VERSION, type Annotation, type SerializedGraph } from '../types.js';

const WARN_PREFIX = '[@myrkh/memory-graph]';

/**
 * Parse a raw localStorage payload into a current-shape {@link SerializedGraph}.
 * Returns `null` when the payload is malformed, from a future version, or empty.
 */
export function parseStoredPayload(raw: string | null): SerializedGraph | null {
  if (!raw) return null;

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!data || typeof data !== 'object') return null;

  const record = data as Record<string, unknown>;
  const rawVersion = typeof record['version'] === 'number' ? (record['version'] as number) : 1;

  if (rawVersion > CURRENT_SCHEMA_VERSION) {
    if (typeof console !== 'undefined') {
      console.warn(
        `${WARN_PREFIX} persisted payload version ${rawVersion} is newer than supported (${CURRENT_SCHEMA_VERSION}) — ignoring.`,
      );
    }
    return null;
  }

  if (rawVersion === 1) return migrateV1ToV2(normalizeV1(record));
  if (rawVersion === 2) return normalizeV2(record);
  return null;
}

interface SerializedGraphV1 {
  version: 1;
  nodes: SerializedGraph['nodes'];
  edges: SerializedGraph['edges'];
  passages: SerializedGraph['passages'];
  intensityBuckets: SerializedGraph['intensityBuckets'];
}

function normalizeV1(record: Record<string, unknown>): SerializedGraphV1 {
  return {
    version: 1,
    nodes: Array.isArray(record['nodes'])
      ? (record['nodes'] as SerializedGraph['nodes'])
      : [],
    edges: Array.isArray(record['edges'])
      ? (record['edges'] as SerializedGraph['edges'])
      : [],
    passages: Array.isArray(record['passages'])
      ? (record['passages'] as SerializedGraph['passages'])
      : [],
    intensityBuckets: Array.isArray(record['intensityBuckets'])
      ? (record['intensityBuckets'] as SerializedGraph['intensityBuckets'])
      : [],
  };
}

function migrateV1ToV2(v1: SerializedGraphV1): SerializedGraph {
  return { ...v1, version: 2, annotations: [] };
}

function normalizeV2(record: Record<string, unknown>): SerializedGraph {
  const v1 = normalizeV1(record);
  return {
    ...v1,
    version: 2,
    annotations: Array.isArray(record['annotations'])
      ? (record['annotations'] as Annotation[])
      : [],
  };
}
