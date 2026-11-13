// A JSON Schema (draft-04) validator for exactly the keywords the vendored
// JSON Resume schema v1.0.0 uses (tests/fixtures/json-resume-schema-v1.0.0.json),
// so the tests need no dependency. A keyword it does not implement throws,
// so a schema that starts using one cannot pass silently.

const ANNOTATIONS = new Set(['$schema', 'title', 'description', 'definitions']);
const IMPLEMENTED = new Set(['type', 'properties', 'additionalProperties', 'items', 'additionalItems', '$ref', 'pattern', 'format']);

const FORMATS = {
  // RFC 3986 absolute URI: a scheme, then no whitespace.
  uri: (s) => /^[a-z][a-z0-9+.-]*:\S*$/i.test(s),
  email: (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s),
  // RFC 3339 full-date.
  date: (s) => /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(s),
};

const typeOf = (value) =>
  Array.isArray(value) ? 'array' : value === null ? 'null' : Number.isInteger(value) ? 'integer' : typeof value;

const matchesType = (value, type) =>
  typeOf(value) === type || (type === 'number' && typeOf(value) === 'integer');

function resolve(root, ref) {
  if (!ref.startsWith('#/')) throw new Error(`only local $ref is supported: ${ref}`);
  return ref.slice(2).split('/').reduce((node, key) => node[key.replace(/~1/g, '/').replace(/~0/g, '~')], root);
}

/**
 * @returns {string[]} one message per violation, empty when valid
 */
export function validate(value, schema, root = schema, at = '$') {
  for (const keyword of Object.keys(schema)) {
    if (!ANNOTATIONS.has(keyword) && !IMPLEMENTED.has(keyword)) throw new Error(`unsupported keyword "${keyword}" at ${at}`);
  }
  if (schema.$ref) return validate(value, resolve(root, schema.$ref), root, at);

  const errors = [];
  if (schema.type) {
    const types = [].concat(schema.type);
    if (!types.some((type) => matchesType(value, type))) return [`${at}: expected ${types.join('|')}, got ${typeOf(value)}`];
  }
  if (typeof value === 'string') {
    if (schema.pattern && !new RegExp(schema.pattern, 'u').test(value)) errors.push(`${at}: "${value}" does not match ${schema.pattern}`);
    if (schema.format) {
      const check = FORMATS[schema.format];
      if (!check) throw new Error(`unsupported format "${schema.format}" at ${at}`);
      if (!check(value)) errors.push(`${at}: "${value}" is not a valid ${schema.format}`);
    }
  }
  if (Array.isArray(value) && schema.items) {
    if (Array.isArray(schema.items)) {
      value.forEach((item, i) => {
        if (i < schema.items.length) errors.push(...validate(item, schema.items[i], root, `${at}[${i}]`));
        else if (schema.additionalItems === false) errors.push(`${at}[${i}]: additional item`);
        else if (typeof schema.additionalItems === 'object') errors.push(...validate(item, schema.additionalItems, root, `${at}[${i}]`));
      });
    } else {
      // additionalItems has no effect when items is a single schema (draft-04 5.3.1).
      value.forEach((item, i) => errors.push(...validate(item, schema.items, root, `${at}[${i}]`)));
    }
  }
  if (typeOf(value) === 'object') {
    const properties = schema.properties ?? {};
    for (const [key, child] of Object.entries(value)) {
      if (properties[key]) errors.push(...validate(child, properties[key], root, `${at}.${key}`));
      else if (schema.additionalProperties === false) errors.push(`${at}: unexpected property "${key}"`);
      else if (typeof schema.additionalProperties === 'object') errors.push(...validate(child, schema.additionalProperties, root, `${at}.${key}`));
    }
  }
  return errors;
}
