import { Injectable } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';

export type MessageType = 'success' | 'error' | 'warning' | 'info';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private duration = 4000;

  constructor(
    private message: NzMessageService,
    private notification: NzNotificationService
  ) {}

  // Mensagens simples (toast)
  showMessage(type: MessageType, content: string): void {
    this.message.create(type, content, { nzDuration: this.duration });
  }

  success(message: string): void {
    this.showMessage('success', message);
  }

  error(message: string): void {
    this.showMessage('error', message);
  }

  warning(message: string): void {
    this.showMessage('warning', message);
  }

  info(message: string): void {
    this.showMessage('info', message);
  }

  // Notificações com título
  showNotification(type: MessageType, title: string, content: string): void {
    this.notification.create(type, title, content, { nzDuration: this.duration });
  }

  notifySuccess(title: string, content: string): void {
    this.showNotification('success', title, content);
  }

  notifyError(title: string, content: string): void {
    this.showNotification('error', title, content);
  }

  notifyWarning(title: string, content: string): void {
    this.showNotification('warning', title, content);
  }

  notifyInfo(title: string, content: string): void {
    this.showNotification('info', title, content);
  }
}