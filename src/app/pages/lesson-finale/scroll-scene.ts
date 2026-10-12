import { afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, NgZone, signal, viewChild } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  AdditiveBlending, AmbientLight, BufferGeometry, DirectionalLight, Float32BufferAttribute, IcosahedronGeometry,
  Mesh, MeshStandardMaterial, PerspectiveCamera, Points, PointsMaterial, Scene, WebGLRenderer
} from 'three';
import { useGsap } from '../../services/gsap';

// Who owns what:
//  - Angular: the markup, the captions, the chapter state, the lifecycle (create / destroy)
//  - GSAP:    time and scroll. A scrubbed ScrollTrigger timeline tweens a plain `params` object
//  - Three:   pixels. One render function reads `params`, driven by gsap.ticker (one loop for both libraries)
@Component({
  selector: 'app-scroll-scene',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="nsc-scroll-scene" [class.is-static]="reduced()">
      <div class="stage">
        <canvas #canvas role="img" aria-label="A faceted globe surrounded by a ring of points, changing as the story progresses"></canvas>
        <ol class="captions">
          @for (c of chapters; track c.title; let i = $index) {
            <li [class.is-active]="i === chapter() || reduced()">
              <p class="kicker">Chapter {{ i + 1 }}</p>
              <h3>{{ c.title }}</h3>
              <p>{{ c.text }}</p>
            </li>
          }
        </ol>
        <div class="progress"></div>
      </div>
    </section>
  `,
  styleUrl: './scroll-scene.scss'
})
export class ScrollScene {
  // Content lives in the template data, rendered by Angular (and by the server): readable without WebGL or JS
  protected readonly chapters = [
    { title: 'A connected world', text: 'Trade, data and people move through one dense network.' },
    { title: 'Fragmentation', text: 'Blocs drift apart; the network loosens and thins out.' },
    { title: 'Rebuilding', text: 'New links form around shared problems: climate, health, technology.' }
  ];
  protected readonly chapter = signal(0);
  protected readonly reduced = signal(false);

  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  // The single source of truth for the 3D state. GSAP tweens these numbers; the render function reads them.
  // A plain object on purpose: 60 updates per second must never go through signals (loop strategy A).
  private readonly params = { rotY: 0, tilt: 0.3, camZ: 6.5, globeScale: 1, ringScale: 1, ringOpacity: 0.9, color: '#c3002f' };
  private render: () => void = () => {};

  constructor() {
    const zone = inject(NgZone), destroyRef = inject(DestroyRef);

    // 1. Three.js: created once, in the browser, before useGsap's setup runs (afterNextRender callbacks run in order)
    afterNextRender(() => {
      const canvas = this.canvas().nativeElement;
      const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      const scene = new Scene();
      const camera = new PerspectiveCamera(40, 1, 0.1, 100);
      scene.add(new AmbientLight(0xffffff, 0.5));
      const key = new DirectionalLight(0xffffff, 2.4);
      key.position.set(3, 4, 5);
      scene.add(key);

      const globeGeometry = new IcosahedronGeometry(1.3, 2);
      const globeMaterial = new MeshStandardMaterial({ color: this.params.color, roughness: 0.4, flatShading: true });
      const globe = new Mesh(globeGeometry, globeMaterial);
      scene.add(globe);

      // A ring of 900 points: "the network"
      const positions: number[] = [];
      for (let i = 0; i < 900; i++) {
        const a = Math.random() * Math.PI * 2, r = 2.2 + Math.random() * 0.8, y = (Math.random() - 0.5) * 0.6;
        positions.push(Math.cos(a) * r, y, Math.sin(a) * r);
      }
      const ringGeometry = new BufferGeometry();
      ringGeometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
      const ringMaterial = new PointsMaterial({ color: 0xffffff, size: 0.035, transparent: true, blending: AdditiveBlending, depthWrite: false });
      const ring = new Points(ringGeometry, ringMaterial);
      scene.add(ring);

      const p = this.params;
      this.render = () => {
        globe.rotation.set(p.tilt, p.rotY, 0);
        globe.scale.setScalar(p.globeScale);
        globeMaterial.color.set(p.color);
        ring.rotation.set(p.tilt * 0.6, -p.rotY * 0.5, 0);
        ring.scale.setScalar(p.ringScale);
        ringMaterial.opacity = p.ringOpacity;
        camera.position.z = p.camZ;
        renderer.render(scene, camera);
      };

      const resize = () => {
        const { clientWidth: w, clientHeight: h } = canvas;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        this.render();
      };

      // One loop for both libraries: GSAP's ticker already runs every frame while tweens/scrub are active,
      // so three.js renders from the same tick. Added outside the zone, and only while the stage is on screen.
      const tick = () => { if (!this.reduced()) this.render(); }; // reduced motion renders on demand instead
      const visibility = new IntersectionObserver(([e]) => zone.runOutsideAngular(() => {
        if (e.isIntersecting) gsap.ticker.add(tick); else gsap.ticker.remove(tick);
      }));
      const resizeObserver = new ResizeObserver(resize);
      zone.runOutsideAngular(() => { resizeObserver.observe(canvas); visibility.observe(canvas); });

      destroyRef.onDestroy(() => {
        gsap.ticker.remove(tick);
        visibility.disconnect();
        resizeObserver.disconnect();
        [globeGeometry, globeMaterial, ringGeometry, ringMaterial].forEach(r => r.dispose());
        renderer.dispose();
        renderer.forceContextLoss();
      });
    });

    // 2. GSAP: the scroll story. Re-built (and the old one reverted) if reduced motion is toggled.
    useGsap((scope, { reduced }) => {
      this.reduced.set(reduced);
      const p = this.params;
      if (reduced) {
        Object.assign(p, { rotY: 0.6, tilt: 0.3, camZ: 6.5, globeScale: 1, ringScale: 1, ringOpacity: 0.9, color: '#c3002f' });
        this.render(); // render on demand: one still frame, captions shown as a plain list
        return;
      }

      const stage = scope.querySelector<HTMLElement>('.stage')!;
      const last = this.chapters.length - 1;
      gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: scope.querySelector('.nsc-scroll-scene'),
          start: 'top top+=72',
          end: '+=2400',
          pin: stage,
          scrub: 0.8,
          onUpdate: (self: ScrollTrigger) => {
            stage.style.setProperty('--progress', self.progress.toFixed(3));       // per frame: CSS variable
            const index = Math.min(last, Math.floor(self.progress * this.chapters.length));
            if (index !== this.chapter()) this.chapter.set(index);                 // per chapter: a signal
          }
        }
      })
        // chapter 1 → 2: the network loosens
        .to(p, { rotY: Math.PI * 0.9, ringScale: 1.6, ringOpacity: 0.35, globeScale: 0.85, color: '#5b6070', camZ: 7.5, duration: 1 })
        // chapter 2 → 3: it regroups, warmer and closer
        .to(p, { rotY: Math.PI * 2, tilt: -0.2, ringScale: 0.95, ringOpacity: 1, globeScale: 1.1, color: '#e3b341', camZ: 5.6, duration: 1 });
    });
  }
}
