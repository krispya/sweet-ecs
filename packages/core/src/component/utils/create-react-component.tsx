import { forwardRef, useImperativeHandle, useLayoutEffect, useMemo, useRef } from 'react';
import { useNearestParent } from 'its-fine';
import { Instance } from '@react-three/fiber';
import { Component } from '../component';
import { addComponentInstance } from '../methods/add-component';
import { removeComponent } from '../methods/remove-component';
import { PlayReactInterface } from '../types';

export const createReactComponent = <T extends typeof Component>(component: T) => {
	return forwardRef<InstanceType<T>, Partial<InstanceType<T>>>(
		function ReactComponent(props, fref) {
			const parent = useNearestParent<Instance<THREE.Object3D>>();
			const instance = useMemo(() => new component() as InstanceType<T>, []);

			useImperativeHandle(fref, () => instance);

			useLayoutEffect(() => {
				const entity = parent.current?.object;
				if (!entity) return;

				addComponentInstance(entity, instance);

				return () => removeComponent(entity, component as any);
			}, [instance, parent]);

			return <primitive object={instance} {...props} />;
		}
	) as unknown as PlayReactInterface<InstanceType<T>>;
};
