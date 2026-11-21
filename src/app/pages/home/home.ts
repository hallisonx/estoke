import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {
  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
  ) {}

  logout(): void {
    this.authService.logout();
    void this.router.navigateByUrl('/');
  }
}
