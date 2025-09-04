import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { DashboardService } from '../../dashboard/shared/services/dashboard.service';
import { UserRole } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class RoleGuardService {

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
    private router: Router
  ) {}

  /**
   * Check if user can access a specific role dashboard
   */
  canAccessRole(requiredRole: UserRole): boolean {
    const user = this.authService.getCurrentUser();
    
    if (!user) {
      this.router.navigate(["/auth/login"]);
      return false;
    }

    const selectedRole = this.dashboardService.getCurrentRole();
    
    if (selectedRole !== requiredRole) {
      this.router.navigate(["/dashboard/role-selector"]);
      return false;
    }

    if (!user.roles?.includes(requiredRole)) {
      this.router.navigate(["/dashboard/role-selector"]);
      return false;
    }

    return true;
  }
}