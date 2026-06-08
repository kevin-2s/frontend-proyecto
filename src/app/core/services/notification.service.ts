import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

export type NotificationSeverity = 'success' | 'error' | 'warn' | 'info';

export interface NotificationOptions {
  life?: number;
  sticky?: boolean;
  summary?: string;
  styleClass?: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private readonly messageService: MessageService) {}

  private normalizeModule(moduleName?: string): string {
    return moduleName
      ? moduleName
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9\-]/g, '')
      : '';
  }

  private defaultSummary(severity: NotificationSeverity, moduleName?: string): string {
    const summaryBySeverity: Record<NotificationSeverity, string> = {
      success: 'Éxito',
      error: 'Error',
      warn: 'Atención',
      info: 'Información',
    };

    const modulePart = moduleName ? `${moduleName} · ` : '';
    return `${modulePart}${summaryBySeverity[severity]}`;
  }

  private buildStyleClass(severity: NotificationSeverity, moduleName?: string, extraClass?: string): string {
    const severityClass = `toast-${severity}`;
    const moduleClass = moduleName ? `toast-module-${this.normalizeModule(moduleName)}` : '';
    return [severityClass, moduleClass, extraClass].filter(Boolean).join(' ');
  }

  private buildSummary(severity: NotificationSeverity, moduleName?: string, customSummary?: string): string {
    const summary = customSummary ?? this.defaultSummary(severity, moduleName);
    if (moduleName) {
      const modulePart = `${moduleName} · `;
      return summary.startsWith(modulePart) ? summary : `${modulePart}${summary}`;
    }
    return summary;
  }

  add(message: {
    severity: NotificationSeverity;
    detail: string;
    summary?: string;
    module?: string;
    life?: number;
    sticky?: boolean;
    styleClass?: string;
  }) {
    const summary = this.buildSummary(message.severity, message.module, message.summary);
    this.messageService.add({
      severity: message.severity,
      summary,
      detail: message.detail,
      life: message.life ?? 5000,
      sticky: message.sticky ?? false,
      styleClass: this.buildStyleClass(message.severity, message.module, message.styleClass),
    });
  }

  success(detail: string, moduleName?: string, options: NotificationOptions = {}) {
    this.add({ severity: 'success', detail, module: moduleName, summary: options.summary, life: options.life, sticky: options.sticky, styleClass: options.styleClass });
  }

  error(detail: string, moduleName?: string, options: NotificationOptions = {}) {
    this.add({ severity: 'error', detail, module: moduleName, summary: options.summary, life: options.life, sticky: options.sticky, styleClass: options.styleClass });
  }

  warn(detail: string, moduleName?: string, options: NotificationOptions = {}) {
    this.add({ severity: 'warn', detail, module: moduleName, summary: options.summary, life: options.life, sticky: options.sticky, styleClass: options.styleClass });
  }

  info(detail: string, moduleName?: string, options: NotificationOptions = {}) {
    this.add({ severity: 'info', detail, module: moduleName, summary: options.summary, life: options.life, sticky: options.sticky, styleClass: options.styleClass });
  }

  pending(detail: string, moduleName?: string, options: NotificationOptions = {}) {
    const summary = options.summary ?? 'Pendiente';
    this.add({ severity: 'info', detail, module: moduleName, summary, life: options.life, sticky: options.sticky, styleClass: options.styleClass });
  }

  expired(detail: string, moduleName?: string, options: NotificationOptions = {}) {
    const summary = options.summary ?? 'Vencimiento';
    this.add({ severity: 'warn', detail, module: moduleName, summary, life: options.life, sticky: options.sticky, styleClass: options.styleClass });
  }
}
