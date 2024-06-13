import { Canvas } from '@react-three/fiber';
import {
	Acceleration,
	CONSTANTS,
	Circle,
	Color,
	IsCentralMass,
	Mass,
	Position,
	Velocity,
	init,
	randInRange,
	schedule,
	setInitial,
	world,
} from '@sim/n-body';
import { Component } from '@sweet-ecs/core';
import * as Sweet from '@sweet-ecs/react';
import { sweet, useWorld } from '@sweet-ecs/react';
import { useSchedule } from 'directed/react';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { syncThreeObjects } from './systems/syncThreeObjects';
import { useRaf } from './use-raf';
import { useStats } from './use-stats';

const BodySpawner = new Sweet.Spawner(Body);

export function App() {
	const frustumSize = 7000;
	const aspect = window.innerWidth / window.innerHeight;

	// Add a system to sync the instanced mesh with component data.
	useSchedule(schedule, syncThreeObjects, { after: 'update' });

	useLayoutEffect(() => {
		// Remove init systems
		if (schedule.has(init)) schedule.remove(init);
		if (schedule.has(setInitial)) schedule.remove(setInitial);
		schedule.build();
	}, []);

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
				<CentralMass />
			</Canvas>
		</Sweet.World>
	);
}

function Bodies() {
	const geo = useMemo(() => new THREE.CircleGeometry(CONSTANTS.MAX_RADIUS / 1.5, 12), []);
	const mat = useMemo(() => new THREE.MeshBasicMaterial(), []);

	return <sweet.instancedMesh args={[geo, mat, CONSTANTS.NBODIES]} />;
}

function Body({ components = [] }: { components: (typeof Component | Component)[] }) {
	const position = useMemo(() => new Position({ x: randInRange(-4000, 4000), y: randInRange(-100, 100) }), []); // prettier-ignore
	const mass = useMemo(() => new Mass(CONSTANTS.BASE_MASS + randInRange(0, CONSTANTS.VAR_MASS)), []); // prettier-ignore

	const circle = useMemo(() => {
		return new Circle(() => {
			return { radius: CONSTANTS.MAX_RADIUS * (mass.value / (CONSTANTS.BASE_MASS + CONSTANTS.VAR_MASS)) + 1 }}); // prettier-ignore
	}, [mass]);

	const velocity = useMemo(() => {
		return new Velocity(() => {
			return calcStableVelocity(position.x, position.y, mass.value);
		});
	}, [mass, position]);

	return (
		<Sweet.Entity
			components={[position, mass, velocity, circle, Acceleration, Color, ...components]}
		/>
	);
}

function CentralMass() {
	const position = useMemo(() => new Position(), []);
	const velocity = useMemo(() => new Velocity(), []);
	const mass = useMemo(() => new Mass(CONSTANTS.CENTRAL_MASS), []);
	const circle = useMemo(() => new Circle(CONSTANTS.MAX_RADIUS / 1.5), []);

	return <Body components={[IsCentralMass, position, velocity, mass, circle]} />;
}

// Simulation runs a schedule.
function Simulation() {
	const world = useWorld();
	const statsApi = useStats({ Bodies: () => CONSTANTS.NBODIES });

	// useRaf(async () => {
	// 	await statsApi.measure(async () => {
	// 		await schedule.run({ world });
	// 	});
	// 	statsApi.updateStats();
	// }, [world, statsApi]);

	const rafRef = useRef<number>(0);

	useEffect(() => {
		const loop = async () => {
			await statsApi.measure(async () => {
				await schedule.run({ world });
			});
			statsApi.updateStats();
			rafRef.current = requestAnimationFrame(loop);
		};
		loop();

		return () => {
			cancelAnimationFrame(rafRef.current);
		};
	}, []);

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
