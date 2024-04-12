import { NormalizedSchema, Schema } from '../types';

export function normalizeSchema(schema: Schema): NormalizedSchema {
	const processedSchema = {} as NormalizedSchema;

	for (const key in schema) {
		if (typeof schema[key] === 'object' && (schema[key] as any)?.type) {
			processedSchema[key] = schema[key] as any;
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
