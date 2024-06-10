import { useEffect, useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './app.css';
import * as Sweet from '@sweet-ecs/react';
import { sweet, useWorld } from '@sweet-ecs/react';

export function App() {
	const [count, setCount] = useState(0);

	return (
		<Sweet.World>
			<RunQuery />
			<sweet.div>
				<a href="https://vitejs.dev" target="_blank">
					<img src={viteLogo} className="logo" alt="Vite logo" />
				</a>
				<a href="https://react.dev" target="_blank">
					<img src={reactLogo} className="logo react" alt="React logo" />
				</a>
			</sweet.div>
			<h1>Vite + React</h1>
			<sweet.div className="card">
				<button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
				<p>
					Edit <code>src/App.tsx</code> and save to test HMR
				</p>
			</sweet.div>
			<p className="read-the-docs">Click on the Vite and React logos to learn more</p>
		</Sweet.World>
	);
}

function RunQuery() {
	const world = useWorld();

	useEffect(() => {
		// Returns 2
		console.log(world.query([Sweet.Div]).length);
	}, [world]);

	return null;
}
