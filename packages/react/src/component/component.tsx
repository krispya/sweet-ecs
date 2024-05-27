import { ComponentArgs, Component as ComponentCore } from '@sweet-ecs/core';
import { useLayoutEffect, useMemo } from 'react';
import { useEntity } from '../entity/use-entity';

type Props<T extends typeof ComponentCore> = {
	type: T;
	ref?: React.RefObject<InstanceType<T>>;
	args?: ComponentArgs<T>;
} & Partial<InstanceType<T>>;

export function Component<T extends typeof ComponentCore>({
	type,
	ref,
	args = [] as ComponentArgs<T>,
	...props
}: Props<T>) {
	const entity = useEntity();
	const component = useMemo(() => new type(...args), [type, args]);

	useLayoutEffect(() => {
		let unsub: () => void;

		if (!entity.isRegistered) {
			unsub = entity.onRegister(() => {
				entity.add(component);

				// Apply props.
				Object.assign(component, props);
			});
		} else {
			entity.add(component);

			// Apply props.
			Object.assign(component, props);
		}

		return () => {
			unsub?.();
			if (entity.isRegistered) entity.remove(type);
		};
	}, [entity]);

	// TODO: Improve prop merging with applyProps.
	// Apply props.
	useLayoutEffect(() => {
		Object.assign(component, props);
	});

	return null;
}
