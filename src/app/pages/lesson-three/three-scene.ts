import { afterNextRender, Component, DestroyRef, effect, ElementRef, inject, Injector, input, NgZone, output, viewChild } from '@angular/core';
import { AmbientLight, DirectionalLight, Group, IcosahedronGeometry, Mesh, MeshStandardMaterial, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { MotionPreference } from '../../services/motion-preference';
import { liveRenderers, SceneStats } from './scene-stats';

// Three.js in Angular, by hand (≈ what react-three-fiber does for you):
// viewChild → canvas · afterNextRender → create · setAnimationLoop outside the zone → run · effects → inputs drive the scene
// · DestroyRef → dispose GPU resources.
@Component({
  selector: 'app-three-scene',
  template: `<canvas #canvas class="nsc-three-scene" role="img" [attr.aria-label]="label()"></canvas>`,
  styles: `
    :host { display: block; aspect-ratio: 16 / 9; border-radius: 12px; overflow: hidden; background: radial-gradient(circle at 70% 30%, #3a0d18, #1d1d1b 70%); }
    .nsc-three-scene { display: block; width: 100%; height: 100%; touch-action: pan-y; }
  `
})
export class ThreeScene {
  readonly color = input('#c3002f');
  readonly detail = input(1);
  readonly autoRotate = input(true);
  readonly leak = input(false);
  readonly label = input('A rotating faceted sculpture that tilts towards the pointer');
  readonly stats = output<SceneStats>();

  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  constructor() {
    const zone = inject(NgZone), destroyRef = inject(DestroyRef), injector = inject(Injector), motion = inject(MotionPreference);

    afterNextRender(() => {
      const canvas = this.canvas().nativeElement;

      // --- create ---
      const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); // cap: a 3× phone screen would render 9× the pixels
      liveRenderers.update(n => n + 1);

      const scene = new Scene();
      const camera = new PerspectiveCamera(40, 16 / 9, 0.1, 100);
      camera.position.set(0, 0, 6);
      scene.add(new AmbientLight(0xffffff, 0.5));
      const key = new DirectionalLight(0xffffff, 2.5);
      key.position.set(3, 4, 5);
      scene.add(key);

      const material = new MeshStandardMaterial({ color: this.color(), roughness: 0.35, metalness: 0.15, flatShading: true });
      let geometry = new IcosahedronGeometry(1.5, this.detail());
      const mesh = new Mesh(geometry, material);
      const tilt = new Group(); // the pointer tilts the group, auto-rotation spins the mesh inside it
      tilt.add(mesh);
      scene.add(tilt);

      const render = () => renderer.render(scene, camera);
      const pointer = { x: 0, y: 0 };
      let visible = true, last = 0, frames = 0, statsAt = 0;

      // --- run: one frame ---
      const tick = (time: number) => {
        const dt = last ? Math.min(time - last, 50) : 16;
        last = time;
        if (this.autoRotate()) { mesh.rotation.y += dt * 0.0005; mesh.rotation.x += dt * 0.0002; }
        tilt.rotation.y += (pointer.x * 0.6 - tilt.rotation.y) * 0.08; // ease towards the pointer
        tilt.rotation.x += (pointer.y * 0.4 - tilt.rotation.x) * 0.08;
        render();

        frames++;
        if (time - statsAt > 500) { // loop strategy B: stats leave the loop twice a second, not 60 times
          const info = renderer.info;
          this.stats.emit({ fps: Math.round((frames * 1000) / (time - statsAt)), calls: info.render.calls, triangles: info.render.triangles, geometries: info.memory.geometries });
          frames = 0; statsAt = time;
        }
      };

      // Start / stop the loop. Always called outside the zone, so rAF never triggers change detection.
      // Paused when off-screen, and with reduced motion (then we render once per change instead: "render on demand").
      const updateLoop = () => zone.runOutsideAngular(() => {
        const running = visible && !motion.reduced();
        renderer.setAnimationLoop(running ? tick : null);
        last = 0;
        if (!running) render();
      });

      // --- observers & listeners, all registered outside the zone ---
      const resize = () => {
        const { clientWidth: w, clientHeight: h } = canvas;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        render();
      };
      const onPointerMove = (e: PointerEvent) => {
        const r = canvas.getBoundingClientRect();
        pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
        pointer.y = ((e.clientY - r.top) / r.height) * 2 - 1;
        if (motion.reduced()) { tilt.rotation.set(pointer.y * 0.4, pointer.x * 0.6, 0); render(); }
      };
      const onPointerLeave = () => { pointer.x = 0; pointer.y = 0; };
      const resizeObserver = new ResizeObserver(resize);
      const visibility = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; updateLoop(); });
      zone.runOutsideAngular(() => {
        canvas.addEventListener('pointermove', onPointerMove);
        canvas.addEventListener('pointerleave', onPointerLeave);
        resizeObserver.observe(canvas);
        visibility.observe(canvas);
      });
      updateLoop();

      // --- inputs → scene. Created here, after the scene exists; the injector ties them to this component. ---
      effect(() => { material.color.set(this.color()); render(); }, { injector });
      effect(() => {
        const detail = this.detail();
        if (geometry.parameters.detail === detail) return;
        const old = geometry;
        geometry = new IcosahedronGeometry(1.5, detail);
        mesh.geometry = geometry;
        old.dispose(); // replacing GPU data means disposing the old buffers, or they stay on the GPU
        render();
      }, { injector });
      effect(() => { motion.reduced(); updateLoop(); }, { injector });

      // --- destroy ---
      destroyRef.onDestroy(() => {
        renderer.setAnimationLoop(null);
        resizeObserver.disconnect();
        visibility.disconnect();
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerleave', onPointerLeave);
        if (this.leak()) return; // ✘ forgot to dispose: buffers and the WebGL context stay alive
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        renderer.forceContextLoss(); // hand the WebGL context back to the browser now, not "eventually"
        liveRenderers.update(n => n - 1);
      });
    });
  }
}
