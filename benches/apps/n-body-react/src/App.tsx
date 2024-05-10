import { Suspense, use, useEffect, useRef } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import Sweet, { useWorld } from '@sweet-ecs/react';
import { Entity, universe } from '@sweet-ecs/core';
import { Mass, Position, Time, Velocity, world } from './globals';

export function App() {
	useEffect(() => {
		console.log('App useEffect run');
		console.log(universe.worlds);
	}, []);

	return (
		<>
			<Suspense>
				<Sweet.World value={world} size={500} resources={[Time]}>
					{/* <Suspending /> */}
					<Body />
				</Sweet.World>
			</Suspense>

			<div>
				<a href="https://vitejs.dev" target="_blank">
					<img src={viteLogo} className="logo" alt="Vite logo" />
				</a>
				<a href="https://react.dev" target="_blank">
					<img src={reactLogo} className="logo react" alt="React logo" />
				</a>
			</div>
			<h1>Vite + React</h1>
			<div className="card">
				<p>
					Edit <code>src/App.tsx</code> and save to test HMR
				</p>
			</div>
			<p className="read-the-docs">Click on the Vite and React logos to learn more</p>
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
			<Sweet.Entity ref={ref}>
				<Suspending />
				<Sweet.Component ref={posRef} key="p" type={Position} />
				<Sweet.Component key="v" type={Velocity} />
				<Sweet.Component key="m" type={Mass} />
			</Sweet.Entity>
		</>
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
