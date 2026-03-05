import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  template: `
    <div class="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div class="min-w-0">
        <h1 class="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center">
          <mat-icon *ngIf="icon" class="mr-2 text-blue-600 dark:text-blue-400">{{ icon }}</mat-icon>
          {{ title }}
        </h1>
        <p *ngIf="subtitle" class="mt-1 text-slate-500 dark:text-slate-400 font-medium truncate">{{ subtitle }}</p>
      </div>
      
      <div class="flex items-center space-x-3 shrink-0">
        <ng-content select="[actions]"></ng-content>
        <button *ngIf="buttonLabel" mat-flat-button color="primary" class="h-10 px-6 rounded-lg font-bold shadow-md hover:shadow-lg transition-all" (click)="buttonClick.emit()">
          <mat-icon *ngIf="buttonIcon" class="mr-1">{{ buttonIcon }}</mat-icon>
          {{ buttonLabel }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() icon = '';
  @Input() buttonLabel = '';
  @Input() buttonIcon = 'add';
  @Output() buttonClick = new EventEmitter<void>();
}
