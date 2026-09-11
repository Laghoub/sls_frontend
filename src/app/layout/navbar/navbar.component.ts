import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { AuthService } from '../../core/config/auth/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  readonly auth = inject(AuthService);

  @Output()
  menuToggle = new EventEmitter<void>();

  toggleMenu(): void {
    this.menuToggle.emit();
  }
}
