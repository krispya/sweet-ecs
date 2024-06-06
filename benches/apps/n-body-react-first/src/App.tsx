import { initStats } from '@app/bench-tools';
import { Canvas } from '@react-three/fiber';
import {
	Acceleration,
	CONSTANTS,
	Circle,
	Color,
	Mass,
	Position,
	Velocity,
	init,
	randInRange,
	schedule,
	setInitial,
	world,
} from '@sim/n-body-soa';
import { Component, Entity } from '@sweet-ecs/core';
import Sweet, { useWorld } from '@sweet-ecs/react';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { ThreeInstances } from './components/ThreeInstances';
import { syncThreeObjects } from './systems/syncThreeObjects';
import { useRaf } from './use-raf';
import { Spawner } from './spawner';

// Add view systems to the schedule
schedule.add(syncThreeObjects, { after: 'update' });
// Remove init systems
// @ts-expect-error - library bug
schedule.remove(init);
// @ts-expect-error - library bug
schedule.remove(setInitial);
schedule.build();

const BodySpawner = new Spawner(Body);
console.log(BodySpawner);

console.log(world);

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
				<BodySpawner.Emitter initial={CONSTANTS.NBODIES - 1} />
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

function Body({ components = [] }: { components: (typeof Component | Component)[] }) {
	const position = useMemo(() => {
		return new Position(randInRange(-4000, 4000), randInRange(-100, 100));
	}, []);

	const mass = useMemo(() => {
		return new Mass(CONSTANTS.BASE_MASS + randInRange(0, CONSTANTS.VAR_MASS));
	}, []);

	const circle = useMemo(() => {
		return new Circle(
			CONSTANTS.MAX_RADIUS * (mass.value / (CONSTANTS.BASE_MASS + CONSTANTS.VAR_MASS)) + 1
		);
	}, [mass]);

	const velocity = useMemo(() => {
		const { x, y } = calcStableVelocity(position.x, position.y, mass.value);
		return new Velocity(x, y);
	}, [mass.value, position.x, position.y]);

	return (
		<Sweet.Entity
			components={[position, mass, velocity, circle, Acceleration, Color, ...components]}
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

function calcStableVelocity(x: number, y: number, mass: number) {
	const radius = Math.sqrt(x ** 2 + y ** 2);
	const normX = x / radius;
	const normY = y / radius;

	// Perpendicular vector for circular orbit
	const vecRotX = -normY;
	const vecRotY = normX;

	const v = Math.sqrt(CONSTANTS.INITIAL_C / radius / mass / CONSTANTS.SPEED);
	return { x: vecRotX * v, y: vecRotY * v };
}
