import { Component, World as WorldCore } from '@sweet-ecs/core';
import React, { useEffect, useRef } from 'react';
import { WorldContext } from './world-context';

type Props = {
	size?: number;
	children?: React.ReactNode;
	resources?: (typeof Component)[];
	value: WorldCore;
};

export function World({ size = 10000, children, resources = [], value: world }: Props) {
	const memoizedResources = useRef(resources);

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
		if (size === world.size) return;
		world.size = size;
	}, [size]);

	return <WorldContext.Provider value={world}>{children}</WorldContext.Provider>;
}
