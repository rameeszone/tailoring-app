import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SidebarModule } from '../../../../shared/models/sidebar-module';
import { UserRole } from '../../../../shared/models/user';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  
  private readonly modules: SidebarModule[] = [
    {
      title: 'Dashboard',
      route: '/dashboard/cashier',
      icon: '🏠',
      roles: [UserRole.CASHIER]
    },
    {
      title: 'Dashboard', 
      route: '/dashboard/supervisor',
      icon: '🏠',
      roles: [UserRole.SUPERVISOR]
    },
    {
      title: 'Dashboard',
      route: '/dashboard/branch-tailor', 
      icon: '🏠',
      roles: [UserRole.BRANCH_TAILOR]
    },
    {
      title: 'Customers',
      route: '/dashboard/customers',
      icon: '👥',
      roles: [UserRole.CASHIER, UserRole.SUPERVISOR, UserRole.BRANCH_TAILOR]
    },
    {
      title: 'Measurements',
      route: '/dashboard/measurements', 
      icon: '📏',
      roles: [UserRole.CASHIER, UserRole.SUPERVISOR, UserRole.BRANCH_TAILOR],
      isComingSoon: true
    },
    {
      title: 'Orders',
      route: '/dashboard/orders',
      icon: '📋', 
      roles: [UserRole.CASHIER, UserRole.SUPERVISOR],
      isComingSoon: true
    },
    {
      title: 'Reports',
      route: '/dashboard/reports',
      icon: '📊',
      roles: [UserRole.SUPERVISOR],
      isComingSoon: true
    }
  ];

  constructor(public router: Router) {}

  getModulesForRole(userRole: UserRole): SidebarModule[] {
    return this.modules
      .filter(module => module.roles.includes(userRole))
      .map(module => ({
        ...module,
        isActive: this.isCurrentRoute(module.route)
      }));
  }

  private isCurrentRoute(route: string): boolean {
    return this.router.url.startsWith(route);
  }

  getDashboardRoute(role: UserRole): string {
    const dashboardModule = this.modules.find(
      module => module.title === 'Dashboard' && module.roles.includes(role)
    );
    return dashboardModule?.route || '/dashboard/role-selector';
  }
}