import { signal } from '@angular/core';

// Lives in its own file on purpose: if the page imported these from three-scene.ts, that static import would pull
// three-scene.ts (and all of three.js) into the page's chunk, and @defer could no longer split it out (lesson 11).
export type SceneStats = { fps: number; calls: number; triangles: number; geometries: number };

// How many WebGL renderers are alive (browsers allow ~16 contexts before dropping the oldest)
export const liveRenderers = signal(0);
