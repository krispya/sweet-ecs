import 'react';
import { Entity as EntityCore } from '@sweet-ecs/core';

// Unpack all here to avoid infinite self-referencing when defining our own JSX namespace
type ReactJSXElement = JSX.Element;
type ReactJSXElementClass = JSX.ElementClass;
type ReactJSXElementAttributesProperty = JSX.ElementAttributesProperty;
type ReactJSXElementChildrenAttribute = JSX.ElementChildrenAttribute;
type ReactJSXLibraryManagedAttributes<C, P> = JSX.LibraryManagedAttributes<C, P>;
type ReactJSXIntrinsicAttributes = JSX.IntrinsicAttributes;
type ReactJSXIntrinsicClassAttributes<T> = JSX.IntrinsicClassAttributes<T>;
type ReactJSXIntrinsicElements = JSX.IntrinsicElements;

// based on the code from @types/react@18.2.8
// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/3197efc097d522c4bf02b94e1a0766d007d6cdeb/types/react/index.d.ts#LL3204C13-L3204C13
type ReactJSXElementType = React.ElementType;

export namespace SweetJSX {
	export type ElementType = ReactJSXElementType;
	export interface Element extends ReactJSXElement {}
	export interface ElementClass extends ReactJSXElementClass {}
	export interface ElementAttributesProperty extends ReactJSXElementAttributesProperty {}
	export interface ElementChildrenAttribute extends ReactJSXElementChildrenAttribute {}

	export type LibraryManagedAttributes<C, P> = ReactJSXLibraryManagedAttributes<C, P>;

	export interface IntrinsicAttributes extends ReactJSXIntrinsicAttributes {}
	export interface IntrinsicClassAttributes<T> extends ReactJSXIntrinsicClassAttributes<T> {}

	export type IntrinsicElements = {
		[K in keyof ReactJSXIntrinsicElements]: ReactJSXIntrinsicElements[K];
	} & {
		entity: React.ClassAttributes<EntityCore> & { children?: React.ReactNode };
	};
}

declare module 'react' {
	namespace JSX {
		interface IntrinsicElements {
			entity: React.ClassAttributes<EntityCore> & { children?: React.ReactNode };
		}
	}
}
