import { Suspense, use, useEffect, useRef, useState } from 'react';
import './App.css';
import Sweet, { WorldContext, useWorld } from '@sweet-ecs/react';
import { Entity, universe } from '@sweet-ecs/core';
import { Mass, Position, Time, Velocity, world } from './globals';

export function App() {
	const [, setCount] = useState(0);

	useEffect(() => {
		console.log('App useEffect run');
		console.log(universe.worlds);

		// setTimeout(() => {
		// 	setCount((v) => v + 1);
		// }, 1000);
	}, []);

	return (
		<Suspense>
			<world size={500} resources={[Time]}>
				<Body />

				<p className="read-the-docs">Click on the Vite and React logos to learn more</p>
			</world>

			<Suspending />
		</Suspense>
	);
}

function Body() {
	const ref = useRef<Entity>(null!);
	const posRef = useRef<Position>(null!);
	const world = useWorld();

	useEffect(() => {
		console.log('Body useEffect run');
		console.log(world.getEntities());
		if (ref.current) console.log(ref.current, ref.current.id);
		if (ref.current) console.log(ref.current.id, ref.current.getAll());
		// console.log(posRef.current);
	});

	// console.log('ents', world.getEntities());
	console.log('Body render');

	// return null;

	// return <p>Body</p>;

	return (
		<entity ref={ref}>
			{/* <Sweet.Component ref={posRef} key="p" type={Position} /> */}
			{/* <Sweet.Component key="v" type={Velocity} /> */}
			{/* <Sweet.Component key="m" type={Mass} value={1} /> */}
			<Mass.Component />
			<Position.Component />
			<Velocity.Component />
			<p>Body</p>
		</entity>
	);
}

const promise = new Promise((resolve) => {
	setTimeout(() => {
		resolve('hello');
	}, 1000);
});

function Suspending() {
	use(promise);
	return null;
}
