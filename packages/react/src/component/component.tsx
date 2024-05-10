import { ComponentArgs, ComponentConstructor } from '@sweet-ecs/core';
import { useLayoutEffect, useRef } from 'react';
import { useEntity } from '../entity/use-entity';

type Props<T extends ComponentConstructor> = {
	type: T;
	ref?: React.RefObject<InstanceType<T>>;
	args?: ComponentArgs<T>;
};

export function Component<T extends ComponentConstructor>({
	type,
	ref,
	args = [] as ComponentArgs<T>,
}: Props<T>) {
	const entity = useEntity();
	const componentRef = useRef<InstanceType<T>>(null!);

	console.log('Component render', type.name, entity.id);

	useLayoutEffect(() => {
		let unsub: () => void;

		if (!entity.isActive) {
			console.log('sub to entity', entity.id);
			unsub = entity.onActive(() => {
				console.log('onActive', type.name, entity.id);
				entity.add(type, ...args);
				componentRef.current = entity.get(type)!;
				if (ref) ref.current = componentRef.current;
			});
		} else {
			console.log('adding component', type.name, entity.id);
			entity.add(type, ...args);
			componentRef.current = entity.get(type)!;
			if (ref) ref.current = componentRef.current;
		}

		return () => {
			console.log('removing component', type.name, entity.id);
			unsub?.();
			if (entity.isActive) entity.remove(type);
		};
	}, [entity]);

	return null;
}
