import './styles.css';
import * as THREE from 'three';
import {
	// CONSTANTS,
	bodyQuery,
	moveBodies,
	setInitial,
	updateColor,
	updateGravityMain,
	world,
	Position,
	Mass,
	Velocity,
	Acceleration,
	CONSTANTS,
} from '@sim/n-body-mt';
import { initStats } from '@app/bench-tools';
import { scene } from './scene';
import { syncThreeObjects } from './systems/syncThreeObjects';
import { World } from '@sim/n-body-mt/world';
import { updateTime } from '@sim/n-body-mt/systems/time';
import { init } from './systems/init';

// Configure the simulation
// CONSTANTS.NBODIES = 2000;

// Renderer
const renderer = new THREE.WebGLRenderer({
	antialias: true,
	powerPreference: 'high-performance',
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Camera
const frustumSize = 8000;
const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.OrthographicCamera(
	(-frustumSize * aspect) / 2,
	(frustumSize * aspect) / 2,
	frustumSize / 2,
	-frustumSize / 2,
	0.1,
	500
);

function onWindowResize() {
	const aspect = window.innerWidth / window.innerHeight;

	camera.left = (-frustumSize * aspect) / 2;
	camera.right = (frustumSize * aspect) / 2;
	camera.top = frustumSize / 2;
	camera.bottom = -frustumSize / 2;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize);

// Camera position
camera.position.set(0, 0, 100);
camera.lookAt(0, 0, 0);

const updateGravity = updateGravityMain({
	queries: { bodyQuery },
	partitionQuery: bodyQuery,
	components: {
		read: { Position: Position.store, Mass: Mass.store },
		write: { Velocity: Velocity.store, Acceleration: Acceleration.store },
	},
});

const pipeline = async (world: World) => {
	updateTime(world);
	setInitial(world);
	await updateGravity(world);
	moveBodies(world);
	updateColor(world);
	syncThreeObjects(world);
};

const { updateStats, measure } = initStats({
	Bodies: () => CONSTANTS.NBODIES,
	Threads: () => window.navigator.hardwareConcurrency,
});

// Run the simulation
const main = async () => {
	await measure(async () => {
		await pipeline(world);
		renderer.render(scene, camera);
		updateStats();
	});
	requestAnimationFrame(main);
};

// Initialize all entities
init(world);

main();
