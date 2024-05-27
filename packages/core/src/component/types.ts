import { Component } from './component';

export type ComponentArgs<T extends typeof Component> = ConstructorParameters<T> extends []
	? []
	: [ConstructorParameters<T>];

export type ComponentProps<T extends typeof Component | Component> = T extends typeof Component
	? Partial<InstanceType<T>>
	: Partial<T>;

export type OmitConstructor<T> = {
	[K in keyof T]: T[K] extends new (...args: any[]) => any ? never : T[K];
};

type Constructor = new (...args: any[]) => any;

type SchemaTypeMap = {
	float64: Float64Array;
	float32: Float32Array;
	int32: Int32Array;
	int16: Int16Array;
	int8: Int8Array;
	uint32: Uint32Array;
	uint16: Uint16Array;
	uint8: Uint8Array;
	uint8clamped: Uint8ClampedArray;
	// Native types mapping
	number: number[];
	string: string[];
	array: any[];
	constructor: InstanceType<Constructor>[];
};

export type Schema = {
	[key: string]:
		| { type: keyof SchemaTypeMap; default?: any }
		| number
		| string
		| any[]
		| Constructor;
};

export type NormalizedSchemaField = { type: keyof SchemaTypeMap; default?: any };

export type NormalizedSchema = {
	[key: string]: NormalizedSchemaField;
};

export type Store<T extends Schema = any> = {
	[P in keyof T]: T[P] extends { type: infer Type }
		? Type extends keyof SchemaTypeMap
			? SchemaTypeMap[Type]
			: never
		: T[P] extends Constructor
		? InstanceType<T[P]>[]
		: T[P][];
};

export type PropsFromSchema<T extends Schema> = {
	[P in keyof T]: T[P] extends { type: infer Type }
		? Type extends keyof SchemaTypeMap
			? number
			: never
		: T[P] extends Constructor
		? InstanceType<T[P]>
		: T[P];
};

export type RecosntructedComponent<T extends Component, TSchema extends Schema> = (new () => T) &
	Omit<OmitConstructor<typeof Component>, 'instances' | 'schema' | 'store'> & {
		store: Store<TSchema>;
		schema: TSchema;
		instances: T[];
	};
