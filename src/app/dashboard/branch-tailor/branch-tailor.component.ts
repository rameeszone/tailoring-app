import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { AuthService } from "../../auth/auth.service";
import { DashboardService } from "../shared/services/dashboard.service";
import { BranchTailorService } from "./branch-tailor.service";
import { DashboardLayoutComponent } from "../shared/layout/dashboard-layout/dashboard-layout.component";
import { User, UserRole } from "../../shared/models/user";

interface QuickStats {
	todayOrders: number;
	pendingPayments: number;
	completedOrders: number;
	totalRevenue: number;
}

interface RecentOrder {
	id: string;
	customerName: string;
	orderDate: Date;
	items: number;
	total: number;
	status: "pending" | "paid" | "in_production" | "ready" | "delivered";
	paymentStatus: "pending" | "paid" | "partial";
}

@Component({
	selector: "app-branch-tailor",
	standalone: true,
	imports: [CommonModule, DashboardLayoutComponent],
	templateUrl: "./branch-tailor.component.html",
	styleUrl: "./branch-tailor.component.scss"
})
export class BranchTailorComponent implements OnInit, OnDestroy {
	readonly UserRole = UserRole;

	currentUser: User | null = null;
	loading = false;
	stats: QuickStats | null = null;
	recentOrders: RecentOrder[] = [];

	private subscriptions = new Subscription();

	constructor(
		private authService: AuthService,
		private dashboardService: DashboardService,
		private branchTailorService: BranchTailorService,
		private router: Router
	) {}

	ngOnInit(): void {
		this.currentUser = this.authService.getCurrentUser();

		// Verify user has branch tailor role
		if (!this.currentUser?.roles?.includes(UserRole.BRANCH_TAILOR)) {
			this.router.navigate(["/dashboard/role-selector"]);
			return;
		}

		this.loadDashboardData();
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	get pageTitle(): string {
		return this.dashboardService.getDashboardTitle(UserRole.BRANCH_TAILOR);
	}

	private loadDashboardData(): void {
		this.loading = true;

		// Load mock data for now
		this.stats = {
			todayOrders: 12,
			pendingPayments: 3,
			completedOrders: 9,
			totalRevenue: 2450.0
		};

		this.recentOrders = [
			{
				id: "ORD-001",
				customerName: "Ahmed Al-Rashid",
				orderDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
				items: 3,
				total: 450.0,
				status: "paid",
				paymentStatus: "paid"
			},
			{
				id: "ORD-002",
				customerName: "Mohammad Hassan",
				orderDate: new Date(Date.now() - 4 * 60 * 60 * 1000),
				items: 2,
				total: 320.0,
				status: "in_production",
				paymentStatus: "paid"
			}
		];

		this.loading = false;
	}

	// Quick actions
	createNewOrder(): void {
		console.log("Navigate to create order");
	}

	viewAllOrders(): void {
		console.log("Navigate to all orders");
	}

	manageCustomers(): void {
		this.router.navigate(['/dashboard/customers']);
	}

	// Utility methods
	formatCurrency(amount: number): string {
		return this.dashboardService.formatCurrency(amount);
	}

	formatDate(date: Date): string {
		return this.dashboardService.formatDate(date);
	}

	getStatusBadgeClass(status: string): string {
		switch (status) {
			case "pending":
				return "status-pending";
			case "paid":
				return "status-paid";
			case "in_production":
				return "status-production";
			case "ready":
				return "status-ready";
			case "delivered":
				return "status-delivered";
			default:
				return "status-default";
		}
	}
}
