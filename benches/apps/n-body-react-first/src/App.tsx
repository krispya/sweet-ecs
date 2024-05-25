import {
	Acceleration,
	CONSTANTS,
	Circle,
	Color,
	Mass,
	Position,
	Time,
	Velocity,
	randInRange,
	world,
} from '@sim/n-body-soa';
import { universe } from '@sweet-ecs/core';
import { use, useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import Sweet from '@sweet-ecs/react';

export function App({ x, y, entityId }) {
	const ref = useRef(null!);
	const position = useCompontent(Position, ref);

	useEffect(() => {
		position.x = x;
		position.y = y;
	}, [x, y, position]);

	return (
		<world src={world} size={CONSTANTS.NBODIES + 1} resources={[Time]}>
			<Sweet.Entity
				ref={ref}
				components={[Position, Mass, Velocity, Acceleration, Color, Circle]}
			>
				<div />
			</Sweet.Entity>

			<Sweet.Entity components={[Position]}>
				<mesh />
			</Sweet.Entity>

			<div>
				<Position.Component x={x} y={y} />
			</div>

			{Spawn(Body, count)}
		</world>
	);
}

function Body({ children }: { children?: React.ReactNode }) {
	const position = useMemo(() => ({ x: randInRange(-4000, 4000), y: randInRange(-100, 100) }), []);
	const mass = useMemo(() => CONSTANTS.BASE_MASS + randInRange(0, CONSTANTS.VAR_MASS), []);

	const velocity = useMemo(() => {
		if (position.x === 0 && position.y === 0) return { x: 0, y: 0 };

		// Calculate velocity for a stable circular orbit
		const radius = Math.sqrt(position.x ** 2 + position.y ** 2);
		const normX = position.x / radius;
		const normY = position.y / radius;

		// Perpendicular vector for circular orbit
		const vecRotX = -normY;
		const vecRotY = normX;

		const v = Math.sqrt(CONSTANTS.INITIAL_C / radius / mass / CONSTANTS.SPEED);
		return { x: vecRotX * v, y: vecRotY * v };
	}, [position, mass]);

	const radius = useMemo(() => {
		return CONSTANTS.MAX_RADIUS * (mass / (CONSTANTS.BASE_MASS + CONSTANTS.VAR_MASS)) + 1;
	}, [mass]);

	return (
		<entity>
			<Mass.Component value={mass} />
			<Position.Component x={position.x} y={position.y} />
			<Velocity.Component x={velocity.x} y={velocity.y} />
			<Circle.Component radius={radius} />
			<Color.Component />
			<Acceleration.Component />
			{children}
		</entity>
	);
}

function Spawn(Element: React.FunctionComponent, count: number) {
	const elements = useRef<React.ReactElement[]>(null!);

	elements.current ??= Array.from({ length: count }, (_, index) => {
		return <Element key={index} />;
	});

	if (elements.current.length < count) {
		elements.current = elements.current.concat(
			Array.from({ length: count - elements.current.length }, (_, index) => {
				return <Element key={index + elements.current.length} />;
			})
		);
	}

	if (elements.current.length > count) {
		elements.current = elements.current.slice(0, count);
	}

	return elements.current;
}
