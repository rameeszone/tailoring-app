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
  if (!this.roleGuardService.canAccessRole(UserRole.CASHIER)) {
    return;
  }
  
  this.currentUser = this.authService.getCurrentUser();
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
