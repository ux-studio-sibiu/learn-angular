import { Component } from '@angular/core';

// A small data-viz block, used inside @defer in lesson 11, so its code lives in its own chunk
@Component({
  selector: 'app-attendance-chart',
  template: `
    <svg class="nsc-attendance-chart" viewBox="0 0 400 180" role="img" aria-label="Attendance per session">
      @for (bar of bars; track bar.label; let i = $index) {
        <rect [attr.x]="20 + i * 75" [attr.y]="150 - bar.value" width="50" [attr.height]="bar.value" rx="4" />
        <text [attr.x]="45 + i * 75" y="168" text-anchor="middle">{{ bar.label }}</text>
        <text [attr.x]="45 + i * 75" [attr.y]="144 - bar.value" text-anchor="middle" class="value">{{ bar.value }}</text>
      }
    </svg>
  `,
  styles: `
    .nsc-attendance-chart { display: block; width: 100%; height: auto; }
    rect { fill: var(--accent); }
    text { fill: var(--muted); font-size: 11px; }
    .value { fill: var(--fg); font-weight: 700; }
  `
})
export class AttendanceChart {
  protected readonly bars = [
    { label: 'Jobs', value: 96 },
    { label: 'Climate', value: 128 },
    { label: 'AI', value: 140 },
    { label: 'Health', value: 74 },
    { label: 'Cities', value: 110 }
  ];
}
