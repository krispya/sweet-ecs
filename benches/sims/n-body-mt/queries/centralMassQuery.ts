import { defineQuery, defineEnterQueue } from '@sweet-ecs/core';
import { Mass, Position, Velocity, IsCentralMass } from '../components';

export const centralMassQuery = defineQuery([Mass, Position, Velocity, IsCentralMass]);
export const enterCentralMassQuery = defineEnterQueue(centralMassQuery);
