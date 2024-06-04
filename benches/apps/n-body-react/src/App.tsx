import { initStats } from '@app/bench-tools';
import { Canvas } from '@react-three/fiber';
import { CONSTANTS, schedule, world } from '@sim/n-body-soa';
import { Entity } from '@sweet-ecs/core';
import Sweet, { useWorld } from '@sweet-ecs/react';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { ThreeInstances } from './components/ThreeInstances';
import { syncThreeObjects } from './systems/syncThreeObjects';
import { useRaf } from './use-raf';

// Add view systems to the schedule
schedule.add(syncThreeObjects, { after: 'update' });

export function App() {
	const frustumSize = 7000;
	const aspect = window.innerWidth / window.innerHeight;

	return (
		<Sweet.World src={world}>
			<Simulation />
			<Canvas
				orthographic
				camera={{
					left: (-frustumSize * aspect) / 2,
					right: (frustumSize * aspect) / 2,
					top: frustumSize / 2,
					bottom: -frustumSize / 2,
					near: 0.1,
					far: 500,
					position: [0, 0, 100],
				}}
			>
				<Bodies />
			</Canvas>
		</Sweet.World>
	);
}

function Bodies() {
	const world = useWorld();
	const geo = useMemo(() => new THREE.CircleGeometry(CONSTANTS.MAX_RADIUS / 1.5, 12), []);
	const mat = useMemo(() => new THREE.MeshBasicMaterial(), []);

	return (
		<instancedMesh
			ref={(node) => {
				if (!node) return;
				const eid = Entity.in(world);
				Entity.add(new ThreeInstances(node), eid);

				return () => {
					Entity.destroy(eid);
				};
			}}
			args={[geo, mat, CONSTANTS.NBODIES]}
		/>
	);
}

// Simulation runs a schedule.
function Simulation() {
	const statsAPI = useMemo(() => initStats({ Bodies: () => CONSTANTS.NBODIES }), []);
	const world = useWorld();

	useEffect(() => {
		statsAPI.create();
		return () => statsAPI.destroy();
	});

	useRaf(() => {
		statsAPI.measure(() => {
			schedule.run({ world });
		});
		statsAPI.updateStats();
	}, [world, statsAPI]);

	return null;
}
