import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { DashboardService } from '../../dashboard/shared/services/dashboard.service';
import { UserRole } from '../models/user';

@Component({
  selector: 'app-redirect',
  standalone: true,
  template: `
    <div class="redirect-container">
      <div class="loading-spinner"></div>
      <p>Redirecting...</p>
    </div>
  `,
  styles: [`
    .redirect-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(255,255,255,0.3);
      border-top: 4px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class AppRedirectComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('🔍 APP REDIRECT COMPONENT INIT');
    this.handleRedirect();
  }

  private handleRedirect(): void {
    const user = this.authService.getCurrentUser();
    const selectedRole = this.dashboardService.getCurrentRole();
    
    console.log('App redirect - User:', user);
    console.log('App redirect - Selected role:', selectedRole);
    
    if (!user) {
      console.log('No user, redirecting to login');
      this.router.navigate(['/auth/login']);
      return;
    }

    if (selectedRole && user.roles?.includes(selectedRole as UserRole)) {
      console.log('Valid stored role found, redirecting to dashboard');
      const dashboardRoute = this.dashboardService.getDashboardRoute(selectedRole as UserRole);
      this.router.navigate([dashboardRoute]);
    } else if (user.roles?.length === 1) {
      console.log('Single role user, storing role and redirecting');
      const role = user.roles[0];
      this.dashboardService.setCurrentRole(role);
      const dashboardRoute = this.dashboardService.getDashboardRoute(role);
      this.router.navigate([dashboardRoute]);
    } else {
      console.log('Multiple roles or no stored role, going to selector');
      this.router.navigate(['/dashboard/role-selector']);
    }
  }
}