import { use } from 'react';
import { WorldContext } from './world-context';

export function useWorld() {
	const world = use(WorldContext);
	if (!world) throw new Error('Sweet ECS: Hooks can only be used within the World component!');
	return world;
}
