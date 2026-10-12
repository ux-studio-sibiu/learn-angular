import { NgOptimizedImage } from '@angular/common';
import { Component, signal } from '@angular/core';
import { AttendanceChart } from '../../components/attendance-chart/attendance-chart';
import { Card } from '../../components/card/card';
import { BouncingCanvas } from '../lesson-lifecycle/bouncing-canvas';

@Component({
  selector: 'app-lesson-defer',
  // Components used only inside @defer blocks are split into their own chunks automatically.
  // Referencing one anywhere else in this file (template or TS) would pull it back into this page's chunk.
  imports: [NgOptimizedImage, BouncingCanvas, AttendanceChart, Card],
  templateUrl: './lesson-defer.html',
  styleUrl: './lesson-defer.scss'
})
export class LessonDefer {
  protected readonly showExtras = signal(false);
}
