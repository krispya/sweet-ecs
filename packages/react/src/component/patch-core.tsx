import { ComponentArgs, ComponentConstructor, Component as ComponentCore } from '@sweet-ecs/core';
import { Component } from './component';

type Props<T extends ComponentConstructor> = {
	ref?: React.RefObject<InstanceType<T>>;
	args?: ComponentArgs<T>;
} & Partial<InstanceType<T>>;

Object.defineProperties(ComponentCore, {
	Component: {
		get(this: ComponentConstructor) {
			return ({ ref, args, ...props }: Props<typeof this>) =>
				Component({ type: this, ref, args, ...props });
		},
		enumerable: false,
		configurable: true,
	},
});

declare module '@sweet-ecs/core/src/component/component' {
	namespace Component {
		export function Component<T extends ComponentConstructor>(this: T, props: Props<T>): null;
	}
}

declare module '@sweet-ecs/core' {
	interface ComponentJSXType<T extends ComponentCore> {
		(props: Props<ComponentConstructor<T>>): null;
	}
}
