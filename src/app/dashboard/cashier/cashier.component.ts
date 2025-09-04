import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { AuthService } from "../../auth/auth.service";
import { DashboardService } from "../shared/services/dashboard.service";
import { CashierService } from "./cashier.service";
import { RoleGuardService } from "./../../shared/services/role-guard.service";
import { DashboardLayoutComponent } from "../shared/layout/dashboard-layout/dashboard-layout.component";
import { User, UserRole } from "../../shared/models/user";

@Component({
	selector: "app-cashier",
	standalone: true,
	imports: [CommonModule, DashboardLayoutComponent],
	templateUrl: "./cashier.component.html",
	styleUrl: "./cashier.component.scss"
})
export class CashierComponent implements OnInit, OnDestroy {
	readonly UserRole = UserRole;

	currentUser: User | null = null;
	loading = false;

	private subscriptions = new Subscription();

	constructor(
		private authService: AuthService,
		private dashboardService: DashboardService,
		private cashierService: CashierService,
		private roleGuardService: RoleGuardService,
		private router: Router
	) {}

	ngOnInit(): void {
		/*
  if (!this.roleGuardService.canAccessRole(UserRole.CASHIER)) {
    return;
  }
  
  this.currentUser = this.authService.getCurrentUser();
  this.loadDashboardData();
  */

    console.log('🔍 CASHIER COMPONENT INIT - DEBUG START');
  
  // Debug current state
  const currentUser = this.authService.getCurrentUser();
  const selectedRole = this.dashboardService.getCurrentRole();
  const sessionRole = sessionStorage.getItem('selected_role');
  
  console.log('Current user:', currentUser);
  console.log('Selected role from service:', selectedRole);
  console.log('Session storage selected_role:', sessionRole);
  console.log('UserRole.CASHIER constant:', UserRole.CASHIER);
  console.log('Selected role === UserRole.CASHIER:', selectedRole === UserRole.CASHIER);
  
  this.currentUser = currentUser;

  if (!this.currentUser) {
    console.log('❌ No current user, redirecting to login');
    this.router.navigate(["/auth/login"]);
    return;
  }

  if (selectedRole !== UserRole.CASHIER) {
    console.log('❌ Selected role mismatch. Expected:', UserRole.CASHIER, 'Got:', selectedRole);
    this.router.navigate(["/dashboard/role-selector"]);
    return;
  }

  if (!this.currentUser.roles?.includes(UserRole.CASHIER)) {
    console.log('❌ User does not have CASHIER role in profile. User roles:', this.currentUser.roles);
    this.router.navigate(["/dashboard/role-selector"]);
    return;
  }

  console.log('✅ All checks passed, loading dashboard data');
  this.loadDashboardData();
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	get pageTitle(): string {
		return this.dashboardService.getDashboardTitle(UserRole.CASHIER);
	}

	private loadDashboardData(): void {
		this.loading = true;
		this.loading = false;
	}

	// Utility methods
	formatCurrency(amount: number): string {
		return this.dashboardService.formatCurrency(amount);
	}

	formatDate(date: Date): string {
		return this.dashboardService.formatDate(date);
	}
}
