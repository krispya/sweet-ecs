import { Component, World as WorldCore } from '@sweet-ecs/core';
import React, { useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef } from 'react';
import { WorldContext } from './world-context';

type Props = {
	size?: number;
	children?: React.ReactNode;
	resources?: (typeof Component)[];
	src?: WorldCore;
	ref?: React.RefObject<WorldCore>;
};

export function World({
	size,
	children,
	resources = [],
	src,
	ref,
}: Props): React.ReactElement<any, any> {
	const memoizedResources = useRef(resources);
	const world = useMemo(() => src ?? WorldCore.define(), [src]);
	useImperativeHandle(ref, () => world);
	const hasSrc = src !== undefined;

	// If we are making the world ourselves, register and destroy it.
	useLayoutEffect(() => {
		if (hasSrc) return;
		if (!world.isRegistered) world.register();

		return () => {
			world.destroy();
		};
	}, [world]);

	// Add world resources.
	useEffect(() => {
		if (!resources) return;
		resources.forEach((resource) => world.add(resource));

		return () => {
			// Only remove resources that are no longer in the list.
			const diff = memoizedResources.current.filter(
				(resource) => !resources.includes(resource)
			);

			diff.forEach((resource) => {
				if (world.has(resource)) world.remove(resource);
			});
		};
	}, [resources]);

	useEffect(() => {
		if (!size) return;
		if (size === world.size) return;
		world.size = size;
	}, [size]);

	return <WorldContext.Provider value={world}>{children}</WorldContext.Provider>;
}
