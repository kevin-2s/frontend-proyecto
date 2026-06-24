import { Component, OnInit, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './infrastructure/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <router-outlet></router-outlet>
  `
})
export class App implements OnInit {
  protected readonly title = signal('logitma-frontend');
  private readonly authService = inject(AuthService);

  ngOnInit(): void {
    // Si hay sesión activa (F5 / recarga de página), recargar los permisos del usuario
    if (this.authService.isAuthenticated()) {
      this.authService.loadUserPermissions();
    }
  }
}
