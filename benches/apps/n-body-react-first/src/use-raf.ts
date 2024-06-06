import { useEffect, useRef } from 'react';

export function useRaf(callback: () => void, deps: readonly unknown[] = []) {
	const rafRef = useRef<number>(0);

	useEffect(() => {
		const loop = () => {
			callback();
			rafRef.current = requestAnimationFrame(loop);
		};
		loop();

		return () => {
			cancelAnimationFrame(rafRef.current);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [callback, ...deps]);
}
