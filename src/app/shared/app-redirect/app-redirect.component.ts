import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { DashboardService } from '../../dashboard/shared/services/dashboard.service';
import { UserRole } from '../models/user';

@Component({
  selector: 'app-redirect',
  standalone: true,
  template: '<div>Redirecting...</div>',
  styles: ['div { text-align: center; padding: 50px; }']
})
export class AppRedirectComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.handleRedirect();
  }

  private handleRedirect(): void {
    // Check if user is logged in
    const user = this.authService.getCurrentUser();
    
    if (!user) {
      // Not logged in, go to login
      this.router.navigate(['/auth/login']);
      return;
    }

    // Check if user has stored role
    const storedRole = this.dashboardService.getCurrentRole();
    
    if (storedRole && user.roles?.includes(storedRole as UserRole)) {
      // Valid stored role, go to dashboard
      const dashboardRoute = this.dashboardService.getDashboardRoute(storedRole as UserRole);
      this.router.navigate([dashboardRoute]);
    } else if (user.roles?.length === 1) {
      // Single role, store and redirect
      const role = user.roles[0];
      this.dashboardService.setCurrentRole(role);
      const dashboardRoute = this.dashboardService.getDashboardRoute(role);
      this.router.navigate([dashboardRoute]);
    } else {
      // Multiple roles, no stored role
      this.router.navigate(['/dashboard/role-selector']);
    }
  }
}