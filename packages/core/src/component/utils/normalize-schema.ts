import { NormalizedSchema, Schema } from '../types';

export function normalizeSchema(schema: Schema): NormalizedSchema {
	const processedSchema = {} as NormalizedSchema;

	for (const key in schema) {
		if (typeof schema[key] === 'object' && (schema[key] as any)?.type) {
			processedSchema[key] = schema[key] as any;

			// TODO: This only covers numbers.
			if (!(schema[key] as any)?.default) {
				processedSchema[key].default = 0;
			}
		} else if (typeof schema[key] === 'number') {
			processedSchema[key] = { type: 'number', default: schema[key] };
		} else if (typeof schema[key] === 'string') {
			processedSchema[key] = { type: 'string', default: schema[key] };
		} else if (Array.isArray(schema[key])) {
			processedSchema[key] = { type: 'array', default: schema[key] };
		} else if (isConstructor(schema[key])) {
			processedSchema[key] = { type: 'constructor', default: schema[key] };
		}
	}

	return processedSchema;
}

function isConstructor(obj: any) {
	return !!obj.prototype && !!obj.prototype.constructor.name;
}
