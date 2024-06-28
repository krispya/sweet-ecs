import { Schedule } from 'directed';
import { setInitial } from './setInitial';
import { updateGravity } from './updateGravity.main';
import { moveBodies } from './moveBodies';
import { updateColor } from './updateColor';
import { updateTime } from './updateTime';
import { World } from '@sweet-ecs/core';
import { init } from './init';

export const schedule = new Schedule<{ world: World }>();

schedule.createTag('update');
schedule.createTag('init');

schedule.add(init, { tag: 'init', before: 'update' });
schedule.add(setInitial, { tag: 'init', after: init, before: 'update' });
schedule.add(updateGravity.init, { tag: 'init', after: setInitial, before: 'update' });

schedule.add(updateTime, { tag: 'update' });
schedule.add(updateGravity.run, { after: updateTime, tag: 'update' });
schedule.add(moveBodies, { after: updateGravity.run, tag: 'update' });
schedule.add(updateColor, { after: moveBodies, tag: 'update' });

schedule.build();
