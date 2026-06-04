type JsonPrimitive = string | number | boolean | null;
export type JsonSafe =
  | JsonPrimitive
  | JsonSafe[]
  | { [key: string]: JsonSafe };

type ObjectIdLike = {
  _bsontype?: string;
  toHexString?: () => string;
  toString?: () => string;
};

type MongooseDocumentLike = {
  toObject: (options?: Record<string, unknown>) => unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isObjectIdLike(value: unknown): value is ObjectIdLike {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.toHexString === "function" ||
    value._bsontype === "ObjectId" ||
    value._bsontype === "ObjectID"
  );
}

function isMongooseDocumentLike(value: unknown): value is MongooseDocumentLike {
  return isRecord(value) && typeof value.toObject === "function";
}

export function toJsonSafe<T = JsonSafe>(value: unknown): T {
  if (value === null || value === undefined) {
    return null as T;
  }

  if (value instanceof Date) {
    return value.toISOString() as T;
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value as T;
  }

  if (typeof value === "bigint") {
    return value.toString() as T;
  }

  if (typeof value === "function" || typeof value === "symbol") {
    return null as T;
  }

  if (isObjectIdLike(value)) {
    if (typeof value.toHexString === "function") {
      return value.toHexString() as T;
    }

    if (typeof value.toString === "function") {
      return value.toString() as T;
    }

    return "" as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => toJsonSafe(item)) as T;
  }

  const source = isMongooseDocumentLike(value)
    ? value.toObject({
        depopulate: false,
        flattenMaps: true,
        getters: false,
        virtuals: false,
      })
    : value;

  if (!isRecord(source)) {
    return null as T;
  }

  return Object.fromEntries(
    Object.entries(source)
      .filter(([key, item]) => key !== "__v" && item !== undefined)
      .map(([key, item]) => [key, toJsonSafe(item)]),
  ) as T;
}
