/** @jsxImportSource @sweet-ecs/react */

import { Suspense, useEffect, useRef, useState } from 'react';
import './App.css';
import Sweet, { useWorld } from '@sweet-ecs/react';
import { Entity, universe } from '@sweet-ecs/core';
import { Mass, Position, Time, Velocity, world } from './globals';

export function App() {
	const [, setCount] = useState(0);

	useEffect(() => {
		console.log('App useEffect run');
		console.log(universe.worlds);

		setTimeout(() => {
			setCount((v) => v + 1);
		}, 1000);
	}, []);

	return (
		<>
			<Suspense>
				<Sweet.World value={world} size={500} resources={[Time]}>
					<Body />

					<p className="read-the-docs">Click on the Vite and React logos to learn more</p>
				</Sweet.World>

				{/* <Suspending /> */}
			</Suspense>
		</>
	);
}

function Body() {
	const ref = useRef<Entity>(null!);
	const posRef = useRef<Position>(null!);
	const world = useWorld();

	console.log(world.getEntities());

	useEffect(() => {
		console.log(ref.current, ref.current.id);
		console.log(ref.current.id, ref.current.getAll());
		console.log(posRef.current);
	});

	return (
		<>
			<entity ref={ref}>
				<Sweet.Component ref={posRef} key="p" type={Position} />
				<Sweet.Component key="v" type={Velocity} />
				<Sweet.Component key="m" type={Mass} />
			</entity>
		</>
	);
}

// const promise = new Promise((resolve) => {
// 	setTimeout(() => {
// 		resolve('hello');
// 	}, 1000);
// });

// function Suspending() {
// 	use(promise);
// 	return null;
// }
