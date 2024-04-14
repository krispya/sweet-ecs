import { defineEnterQueue, defineQuery } from '@sweet-ecs/core';
import { Position } from '../components/Position';
import { Velocity } from '../components/Velocity';
import { Mass } from '../components/Mass';
import { IsCentralMass } from '../components/IsCentralMass';

export const bodyQuery = defineQuery([Position, Velocity, Mass]);
export const centralMassQuery = defineQuery([Mass, Position, Velocity, IsCentralMass]);
export const enterBodyQuery = defineEnterQueue(bodyQuery);
export const enterCentralMassQuery = defineEnterQueue(centralMassQuery);
