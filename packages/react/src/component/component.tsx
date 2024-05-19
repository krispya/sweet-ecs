import { ComponentArgs, ComponentConstructor } from '@sweet-ecs/core';
import { useLayoutEffect, useRef } from 'react';
import { useEntity } from '../entity/use-entity';

type Props<T extends ComponentConstructor> = {
	type: T;
	ref?: React.RefObject<InstanceType<T>>;
	args?: ComponentArgs<T>;
} & Partial<InstanceType<T>>;

export function Component<T extends ComponentConstructor>({
	type,
	ref,
	args = [] as ComponentArgs<T>,
	...props
}: Props<T>) {
	const entity = useEntity();
	const componentRef = useRef<InstanceType<T>>(null!);

	useLayoutEffect(() => {
		let unsub: () => void;

		if (!entity.isRegistered) {
			unsub = entity.onRegister(() => {
				entity.add(type, ...args);
				componentRef.current = entity.get(type)!;
				if (ref) ref.current = componentRef.current;
			});
		} else {
			entity.add(type, ...args);
			componentRef.current = entity.get(type)!;
			if (ref) ref.current = componentRef.current;
		}

		return () => {
			unsub?.();
			if (entity.isRegistered) entity.remove(type);
		};
	}, [entity]);

	// TODO: Implement prop merging.
	console.log('props', type.name, props);

	return null;
}
