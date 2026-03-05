import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private snackBar = inject(MatSnackBar);
  private duration = 4000;

  success(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: this.duration,
      panelClass: ['toast-success'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  error(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: this.duration + 2000,
      panelClass: ['toast-error'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  warning(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: this.duration,
      panelClass: ['toast-warning'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  info(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: this.duration,
      panelClass: ['toast-info'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  // Compatibilidade com métodos antigos de notificação com título
  notifySuccess(title: string, content: string): void {
    this.success(`${title}: ${content}`);
  }

  notifyError(title: string, content: string): void {
    this.error(`${title}: ${content}`);
  }

  notifyWarning(title: string, content: string): void {
    this.warning(`${title}: ${content}`);
  }

  notifyInfo(title: string, content: string): void {
    this.info(`${title}: ${content}`);
  }
}