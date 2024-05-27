import { Canvas, useFrame } from '@react-three/fiber';
import {
	Acceleration,
	CONSTANTS,
	Circle,
	Color,
	Mass,
	Position,
	Velocity,
	init,
	moveBodies,
	setInitial,
	updateColor,
	updateGravity,
	updateTime,
	world,
} from '@sim/n-body-soa';
import { Component, Entity } from '@sweet-ecs/core';
import Sweet, { useWorld } from '@sweet-ecs/react';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { ThreeInstances } from './components/ThreeInstances';
import { syncThreeObjects } from './systems/syncThreeObjects';

// Simulate having a schedule.
const schedule = [init, updateTime, setInitial, updateGravity, moveBodies, updateColor];
// Body defintion.
const body = [Position, Mass, Velocity, Color, Circle, Acceleration];

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
				{/* <Sweet.World src={world}>{spawn(Body, body)}</Sweet.World> */}
				<Bodies />
			</Canvas>
		</Sweet.World>
	);
}

function Bodies() {
	const world = useWorld();
	const geo = useMemo(() => new THREE.CircleGeometry(CONSTANTS.MAX_RADIUS / 1.5, 12), []);
	const mat = useMemo(() => new THREE.MeshBasicMaterial(), []);

	// Simulate adding and removing syncThreeObjects from the schedule.
	useLayoutEffect(() => {
		schedule.push(syncThreeObjects);
		return () => {
			const index = schedule.indexOf(syncThreeObjects);
			schedule.splice(index, 1);
		};
	}, []);

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

function Body({ entityId }: { entityId: number }) {
	const ref = useRef<THREE.Mesh>(null);
	const radius = normalize(Circle.get(entityId).radius, 0, 60);

	useFrame(() => {
		if (!ref.current) return;

		// Set position
		ref.current.position.x = Position.store.x[entityId];
		ref.current.position.y = Position.store.y[entityId];

		// Set color
		const color = Color.get(entityId);
		(ref.current.material as THREE.MeshBasicMaterial).color.setRGB(
			normalize(color.r, 0, 255),
			normalize(color.g, 0, 255),
			normalize(color.b, 0, 255)
		);
	});

	return (
		<mesh ref={ref} scale={radius}>
			<circleGeometry args={[CONSTANTS.MAX_RADIUS / 1.5, 12]} />
			{/* @ts-expect-error - R3F bug */}
			<meshBasicMaterial color="red" />
		</mesh>
	);
}

// Simulation runs a schedule.
function Simulation() {
	const rafRef = useRef<number>(0);
	const world = useWorld();

	useEffect(() => {
		const loop = () => {
			for (const fn of schedule) fn(world);
			rafRef.current = requestAnimationFrame(loop);
		};
		loop();

		return () => {
			cancelAnimationFrame(rafRef.current);
		};
	}, [world]);

	return null;
}

function spawn(
	Element: (props: { entityId: number }) => JSX.Element,
	signature: (typeof Component)[],
	initial?: number
) {
	return <Spawn Element={Element} signature={signature} initial={initial} />;
}

type SpawnProps = {
	Element: (props: { entityId: number }) => JSX.Element;
	signature: (typeof Component)[];
	initial?: number;
};

function Spawn({ Element, signature }: SpawnProps) {
	const world = useWorld();
	const eids = world.query(signature);

	return Array.from({ length: eids.length }, (_, i) => (
		<Sweet.Entity key={eids[i]} entityId={eids[i]}>
			<Element entityId={eids[i]} />
		</Sweet.Entity>
	));
}

const normalize = (x: number, min: number, max: number) => (x - min) / (max - min);
