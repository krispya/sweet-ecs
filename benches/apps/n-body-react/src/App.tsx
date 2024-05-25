import { Canvas, useThree } from '@react-three/fiber';
import {
	Acceleration,
	Circle,
	Color,
	Mass,
	Position,
	Velocity,
	init,
	setInitial,
	updateColor,
	updateGravity,
	updateTime,
	world,
} from '@sim/n-body-soa';
import { Component } from '@sweet-ecs/core';
import Sweet, { useWorld } from '@sweet-ecs/react';
import { useEffect, useRef } from 'react';
import { useEntity } from '../../../../packages/react/src/entity/use-entity';

const body = [Position, Mass, Velocity, Color, Circle, Acceleration];

export function App() {
	const frustumSize = 7000;
	const aspect = window.innerWidth / window.innerHeight;

	return (
		<>
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
				<Sweet.World src={world}>{spawn(Body, body)}</Sweet.World>
				{/* <Camera /> */}
			</Canvas>
		</>
	);
}

console.log(Position.store);

function Body() {
	const entity = useEntity();
	const position = Position.get(entity.id);

	return (
		<mesh position={[position.x, position.y, 0]}>
			<circleGeometry args={[10, 12]} />
			<meshBasicMaterial color="red" />
		</mesh>
	);
}

// function Camera() {
// 	const ref = useRef<THREE.OrthographicCamera>(null!);
// 	const set = useThree(({ set }) => set);
// 	const aspect = window.innerWidth / window.innerHeight;
// 	const frustumSize = 8000;

// 	useLayoutEffect(() => {
// 		set({ camera: ref.current });
// 		ref.current.lookAt(0, 0, 0);
// 		ref.current.updateProjectionMatrix();
// 	}, [set]);

// 	return <orthographicCamera ref={ref} near={0.01} far={500} zoom={1} position={[0, 0, 100]} />;
// }

// Simulation runs a schedule.
function Simulation() {
	const rafRef = useRef<number>(0);

	useEffect(() => {
		const loop = () => {
			init(world);
			updateTime(world);
			setInitial(world);
			updateGravity(world);
			// moveBodies(world);
			updateColor(world);
			rafRef.current = requestAnimationFrame(loop);
		};
		loop();

		return () => {
			cancelAnimationFrame(rafRef.current);
		};
	}, []);

	return null;
}

function spawn(Element: React.FunctionComponent, signature: (typeof Component)[], initial?: number) {
	return <Spawn Element={Element} signature={signature} initial={initial} />;
}

type SpawnProps = {
	Element: React.FunctionComponent;
	signature: (typeof Component)[];
	initial?: number;
};

function Spawn({ Element, signature }: SpawnProps) {
	const scene = useThree().scene;
	console.log(scene);
	const world = useWorld();
	const eids = world.query(signature);

	console.log('eids', eids.length);

	return Array.from({ length: eids.length }, (_, i) => (
		<Sweet.Entity key={eids[i]} entityId={eids[i]}>
			<Element />
		</Sweet.Entity>
	));
}
