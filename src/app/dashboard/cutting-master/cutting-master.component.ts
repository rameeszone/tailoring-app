import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { AuthService } from "../../auth/auth.service";
import { DashboardService } from "../shared/services/dashboard.service";
import { CuttingMasterService } from "./cutting-master.service";
import { RoleGuardService } from "./../../shared/services/role-guard.service";
import { DashboardLayoutComponent } from "../shared/layout/dashboard-layout/dashboard-layout.component";
import { User, UserRole } from "../../shared/models/user";

interface CuttingTask {
	id: string;
	orderNumber: string;
	customerName: string;
	garmentType: string;
	fabricType: string;
	priority: "high" | "normal" | "low";
	pieces: number;
	status: "pending" | "in_progress" | "completed";
	qrCode: string;
	assignedAt: Date;
}

interface DailyStats {
	assignedTasks: number;
	completedTasks: number;
	inProgress: number;
	fabricsUsed: number;
}

@Component({
	selector: "app-cutting-master",
	standalone: true,
	imports: [CommonModule, DashboardLayoutComponent],
	templateUrl: "./cutting-master.component.html",
	styleUrl: "./cutting-master.component.scss"
})
export class CuttingMasterComponent implements OnInit, OnDestroy {
	readonly UserRole = UserRole;

	currentUser: User | null = null;
	loading = false;
	stats: DailyStats | null = null;
	tasks: CuttingTask[] = [];

	private subscriptions = new Subscription();

	constructor(
		private authService: AuthService,
		private dashboardService: DashboardService,
		private cuttingMasterService: CuttingMasterService,
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
		return this.dashboardService.getDashboardTitle(UserRole.CUTTING_MASTER);
	}

	private loadDashboardData(): void {
		this.loading = true;

		// Mock data for now
		this.stats = {
			assignedTasks: 8,
			completedTasks: 5,
			inProgress: 2,
			fabricsUsed: 12
		};

		this.tasks = [
			{
				id: "CUT-001",
				orderNumber: "ORD-1001",
				customerName: "Ahmed Al-Rashid",
				garmentType: "Thobe",
				fabricType: "Cotton",
				priority: "high",
				pieces: 4,
				status: "pending",
				qrCode: "QR-CUT-001",
				assignedAt: new Date(Date.now() - 30 * 60 * 1000)
			},
			{
				id: "CUT-002",
				orderNumber: "ORD-1002",
				customerName: "Mohammad Hassan",
				garmentType: "Shirt",
				fabricType: "Linen",
				priority: "normal",
				pieces: 2,
				status: "in_progress",
				qrCode: "QR-CUT-002",
				assignedAt: new Date(Date.now() - 60 * 60 * 1000)
			}
		];

		this.loading = false;
	}

	// Actions
	startTask(taskId: string): void {
		console.log("Start cutting task:", taskId);
	}

	completeTask(taskId: string): void {
		console.log("Complete cutting task:", taskId);
	}

	scanQRCode(): void {
		console.log("Open QR scanner");
	}

	viewTaskDetails(taskId: string): void {
		console.log("View task details:", taskId);
	}

	// Utility methods
	formatDate(date: Date): string {
		return this.dashboardService.formatRelativeTime(date);
	}

	getPriorityClass(priority: string): string {
		switch (priority) {
			case "high":
				return "priority-high";
			case "normal":
				return "priority-normal";
			case "low":
				return "priority-low";
			default:
				return "priority-normal";
		}
	}

	getStatusClass(status: string): string {
		switch (status) {
			case "pending":
				return "status-pending";
			case "in_progress":
				return "status-progress";
			case "completed":
				return "status-completed";
			default:
				return "status-pending";
		}
	}
}
