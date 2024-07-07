import { Canvas, useThree } from '@react-three/fiber';
import { CONSTANTS, schedule, world } from '@sim/n-body';
import { Component } from '@sweet-ecs/core';
import * as Sweet from '@sweet-ecs/react';
import { sweet, useWorld } from '@sweet-ecs/react';
import { useSchedule } from 'directed/react';
import { useLayoutEffect } from 'react';
import { TurboWebGLRenderer } from 'turbo-webgl-renderer';
import { syncThreeObjects } from './systems/syncThreeObjects';
import { useRaf } from './use-raf';
import { useStats } from './use-stats';

const BodySpawner = new Sweet.Spawner(Body);

console.log(BodySpawner);

export function App() {
	const frustumSize = 7000;
	const aspect = window.innerWidth / window.innerHeight;

	// Add a system to sync the instanced mesh with component data.
	useSchedule(schedule, syncThreeObjects, { after: 'update' });

	return (
		<Sweet.World src={world}>
			<Canvas
				gl={(canvas) => {
					const renderer = new TurboWebGLRenderer({
						antialias: true,
						powerPreference: 'high-performance',
						canvas,
					});

					return renderer;
				}}
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
				<BodySpawner.Emitter initial={CONSTANTS.NBODIES} />
				<Simulation />
			</Canvas>
		</Sweet.World>
	);
}

// View is added automatically.
function Body({ components = [] }: { components?: (typeof Component | Component)[] }) {
	return (
		<sweet.mesh components={components}>
			<circleGeometry args={[CONSTANTS.MAX_RADIUS / 1.5, 12]} />
			<meshBasicMaterial />
		</sweet.mesh>
	);
}

// Simulation runs a schedule.
function Simulation() {
	const world = useWorld();
	const statsApi = useStats({ Bodies: () => CONSTANTS.NBODIES });
	const gl = useThree((state) => state.gl) as TurboWebGLRenderer;
	const camera = useThree((state) => state.camera);
	const scene = useThree((state) => state.scene);

	useLayoutEffect(() => {
		gl.init(scene, camera);
	}, [camera, gl, scene]);

	useRaf(async () => {
		await statsApi.measure(async () => {
			await schedule.run({ world });
		});
		statsApi.updateStats();
	}, [world, statsApi]);

	return null;
}
