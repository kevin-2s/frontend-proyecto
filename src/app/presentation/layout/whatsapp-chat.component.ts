import { Component, inject, signal, ElementRef, ViewChild, AfterViewChecked, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WhatsappChatService } from '../../core/services/whatsapp-chat.service';
import { environment } from '../../../environments/environment';

interface ChatMessage {
  text: string;
  isBot: boolean;
  time: Date;
}

@Component({
  selector: 'app-whatsapp-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- ====================================================== -->
    <!-- BOTÓN ROBOT — Abre el chat del sistema (Asistente SGM) -->
    <!-- Posicionado encima del botón de WhatsApp               -->
    <!-- ====================================================== -->
    <div class="fixed bottom-24 right-6 z-[999] flex items-center gap-3 group">
      <!-- Tooltip on hover -->
      <div *ngIf="!isOpen()"
           class="bg-white text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-[0_6px_25px_rgba(79,70,229,0.15)] border border-indigo-50 opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 pointer-events-none transition-all duration-300 origin-right whitespace-nowrap">
        💬 Asistente SGM
      </div>

      <!-- Trigger Button -->
      <button (click)="toggleChat()"
              class="w-[52px] h-[52px] rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 active:scale-95 relative overflow-hidden focus:outline-none"
              [class.bg-red-500]="isOpen()"
              [class.shadow-[0_6px_20px_rgba(239,68,68,0.4)]]="isOpen()"
              [class.bg-[#4F46E5]]="!isOpen()"
              [class.shadow-[0_6px_24px_rgba(79,70,229,0.5)]]="!isOpen()">
        <!-- Pulse hover ring -->
        <span class="absolute inset-0 rounded-full bg-white/20 scale-0 group-hover:scale-150 transition-transform duration-700 ease-out pointer-events-none"></span>

        <!-- Robot SVG (closed state) -->
        <svg *ngIf="!isOpen()" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7 relative z-10">
          <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h2a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4v-6a4 4 0 0 1 4-4h2V5.73A2 2 0 0 1 10 4a2 2 0 0 1 2-2zm-4 9a1.5 1.5 0 0 0 0 3 1.5 1.5 0 0 0 0-3zm8 0a1.5 1.5 0 0 0 0 3 1.5 1.5 0 0 0 0-3zm-4 4a3 3 0 0 0-2.6 1.5h5.2A3 3 0 0 0 12 15z"/>
        </svg>
        <!-- X (open state) -->
        <i *ngIf="isOpen()" class="pi pi-times text-lg relative z-10"></i>
      </button>
    </div>

    <!-- ====================================================== -->
    <!-- VENTANA DE CHAT DEL SISTEMA                             -->
    <!-- ====================================================== -->
    <div *ngIf="isOpen()"
         class="fixed bottom-[9.5rem] right-6 w-[360px] max-w-[calc(100vw-32px)] h-[480px] max-h-[calc(100vh-220px)] bg-white rounded-3xl shadow-[0_16px_50px_rgba(79,70,229,0.2)] border border-indigo-50 flex flex-col overflow-hidden z-[998] animate-chat-open origin-bottom-right">

      <!-- Header -->
      <div class="bg-gradient-to-r from-[#4338CA] to-[#6366F1] text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div class="flex items-center gap-3">
          <!-- Robot avatar -->
          <div class="w-10 h-10 rounded-full bg-white/15 border border-white/25 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-white">
              <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h2a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4v-6a4 4 0 0 1 4-4h2V5.73A2 2 0 0 1 10 4a2 2 0 0 1 2-2zm-4 9a1.5 1.5 0 0 0 0 3 1.5 1.5 0 0 0 0-3zm8 0a1.5 1.5 0 0 0 0 3 1.5 1.5 0 0 0 0-3zm-4 4a3 3 0 0 0-2.6 1.5h5.2A3 3 0 0 0 12 15z"/>
            </svg>
          </div>
          <div class="flex flex-col">
            <span class="font-bold text-sm leading-tight">Asistente SGM</span>
            <span class="text-[11px] text-indigo-200 font-medium leading-none mt-0.5">Sistema de Gestión de Materiales</span>
            <span class="flex items-center gap-1 text-[10px] text-indigo-200 mt-1 font-semibold">
              <span class="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
              En línea
            </span>
          </div>
        </div>
        <button (click)="closeChat()"
                class="text-white/70 hover:text-white hover:bg-white/15 w-8 h-8 rounded-full flex items-center justify-center transition-colors focus:outline-none">
          <i class="pi pi-minus text-sm"></i>
        </button>
      </div>

      <!-- Messages Area -->
      <div #messageContainer
           class="flex-1 overflow-y-auto px-4 py-3 bg-[#f5f4ff] flex flex-col gap-2.5 min-h-0">

        <div *ngFor="let msg of messages()"
             [class.justify-end]="!msg.isBot"
             [class.justify-start]="msg.isBot"
             class="flex w-full">

          <div [class.bg-white]="msg.isBot"
               [class.text-slate-700]="msg.isBot"
               [class.rounded-tl-none]="msg.isBot"
               [class.bg-[#E0E7FF]]="!msg.isBot"
               [class.text-indigo-900]="!msg.isBot"
               [class.rounded-tr-none]="!msg.isBot"
               class="max-w-[85%] rounded-2xl px-3 py-2 text-[13px] shadow-sm border border-slate-100/60 flex flex-col">

            <p class="whitespace-pre-line leading-relaxed" [innerHTML]="formatMessage(msg.text)"></p>

            <div class="flex items-center justify-end gap-1 text-[9px] text-slate-400 mt-1 self-end leading-none">
              <span>{{ msg.time | date: 'HH:mm' }}</span>
              <span *ngIf="!msg.isBot" class="text-indigo-400">
                <i class="pi pi-check-double"></i>
              </span>
            </div>
          </div>
        </div>

        <!-- Bot Typing Indicator -->
        <div *ngIf="isTyping()" class="flex justify-start w-full animate-fade-in">
          <div class="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-slate-100 flex items-center gap-1">
            <span class="w-2 h-2 bg-indigo-400 rounded-full animate-typing-dot"></span>
            <span class="w-2 h-2 bg-indigo-400 rounded-full animate-typing-dot" style="animation-delay:0.2s"></span>
            <span class="w-2 h-2 bg-indigo-400 rounded-full animate-typing-dot" style="animation-delay:0.4s"></span>
          </div>
        </div>
      </div>

      <!-- Input Bar -->
      <form (submit)="sendMessage(); $event.preventDefault()"
            class="bg-white p-3 flex items-center gap-2 border-t border-slate-100 flex-shrink-0">
        <input type="text"
               name="message"
               [(ngModel)]="messageText"
               placeholder="Escribe un mensaje..."
               autocomplete="off"
               [disabled]="isTyping()"
               class="flex-1 bg-[#f5f4ff] border border-slate-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 text-slate-800 placeholder-slate-400 transition-all">
        <button type="submit"
                [disabled]="!messageText.trim() || isTyping()"
                [class.opacity-40]="!messageText.trim() || isTyping()"
                class="w-9 h-9 rounded-full bg-[#4F46E5] hover:bg-[#4338CA] text-white flex items-center justify-center focus:outline-none shadow-md hover:scale-105 transition-all">
          <i class="pi pi-send text-sm ml-0.5"></i>
        </button>
      </form>
    </div>
  `,
  styles: [`
    @keyframes typingDot {
      0%, 100% { transform: translateY(0); opacity: 0.5; }
      50% { transform: translateY(-5px); opacity: 1; }
    }
    .animate-typing-dot { animation: typingDot 1s infinite ease-in-out; }

    .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .animate-chat-open { animation: chatOpen 0.28s cubic-bezier(0.34,1.56,0.64,1) forwards; }
    @keyframes chatOpen {
      from { opacity: 0; transform: scale(0.88) translateY(10px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }
  `]
})
export class WhatsappChatComponent implements OnInit, AfterViewChecked {
  private chatService = inject(WhatsappChatService);

  @ViewChild('messageContainer') private messageContainer!: ElementRef;

  isOpen = signal(false);
  isTyping = signal(false);
  messageText = '';

  messages = signal<ChatMessage[]>([
    {
      text: '¡Hola! Soy el asistente virtual del Sistema de Gestión de Materiales (SGM). ¿En qué puedo ayudarte hoy?\n\nPuedes preguntarme por:\n• Productos\n• Préstamos\n• Bodegas\n• Novedades',
      isBot: true,
      time: new Date()
    }
  ]);

  ngOnInit() {}

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  toggleChat() {
    this.isOpen.update(v => !v);
    if (this.isOpen()) setTimeout(() => this.scrollToBottom(), 50);
  }

  closeChat() {
    this.isOpen.set(false);
  }

  sendMessage() {
    const text = this.messageText.trim();
    if (!text || this.isTyping()) return;

    this.messages.update(list => [...list, { text, isBot: false, time: new Date() }]);
    this.messageText = '';
    this.isTyping.set(true);
    this.scrollToBottom();

    this.chatService.sendMessage(text).subscribe({
      next: (botReply) => {
        this.messages.update(list => [...list, { text: botReply, isBot: true, time: new Date() }]);
        this.isTyping.set(false);
        this.scrollToBottom();
      },
      error: () => { this.isTyping.set(false); }
    });
  }

  scrollToBottom(): void {
    try {
      if (this.messageContainer)
        this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
    } catch (e) {}
  }

  formatMessage(text: string): string {
    if (!text) return '';
    let f = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    f = f.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    f = f.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
    f = f.replace(/•\s?/g, '&bull; ');
    return f;
  }
}
