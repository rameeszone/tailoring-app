import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { AuthService } from "../../auth/auth.service";
import { DashboardService } from "../shared/services/dashboard.service";
import { User, UserRole } from "../../shared/models/user";

interface RoleOption {
	role: UserRole;
	title: string;
	description: string;
	route: string;
	icon: string;
	deviceType: "desktop" | "mobile" | "both";
}

@Component({
	selector: "app-role-selector",
	standalone: true,
	imports: [CommonModule],
	templateUrl: "./role-selector.component.html",
	styleUrl: "./role-selector.component.scss"
})
export class RoleSelectorComponent implements OnInit, OnDestroy {
	currentUser: User | null = null;
	availableRoles: RoleOption[] = [];
	loading = false;

	private subscriptions = new Subscription();

	constructor(
		private authService: AuthService,
		private router: Router,
		private dashboardService: DashboardService
	) {}

	ngOnInit(): void {
		this.currentUser = this.authService.getCurrentUser();

		if (this.currentUser) {
			this.processUserRoles();
		} else {
			const userSub = this.authService.currentUser$.subscribe((user) => {
				if (user) {
					this.currentUser = user;
					this.processUserRoles();
				}
			});
			this.subscriptions.add(userSub);

			setTimeout(() => {
				if (!this.currentUser) {
					this.router.navigate(["/auth/login"]);
				}
			}, 2000);
		}
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	private processUserRoles(): void {
		if (!this.currentUser?.roles || this.currentUser.roles.length === 0) {
			this.router.navigate(["/auth/login"]);
			return;
		}

		if (this.currentUser.roles.length === 1) {
			this.selectRole(this.currentUser.roles[0]);
			return;
		}

		// Multiple roles, show selection using dashboard service
		this.availableRoles = this.currentUser.roles
			.map((role) => {
				const config = this.dashboardService.getRoleConfig(role);
				return config
					? {
							role: config.role,
							title: config.title,
							description: `${config.title.replace(" Dashboard", "")} operations`,
							route: config.route,
							icon: config.icon,
							deviceType: config.deviceType
						}
					: null;
			})
			.filter(Boolean) as RoleOption[];
	}

	selectRole(role: UserRole): void {
		this.loading = true;
		const config = this.dashboardService.getRoleConfig(role);

		if (config) {
			this.dashboardService.setCurrentRole(role);
			this.router.navigate([config.route]);
		} else {
			console.error("Invalid role selected:", role);
			this.loading = false;
		}
	}

	logout(): void {
		this.authService.logout().subscribe({
			next: () => {
				console.log("Logout successful");
			},
			error: (error) => {
				console.error("Logout error:", error);
				this.router.navigate(["/auth/login"]);
			}
		});
	}

	getDeviceIcon(deviceType: "desktop" | "mobile" | "both"): string {
		switch (deviceType) {
			case "desktop":
				return "💻";
			case "mobile":
				return "📱";
			case "both":
				return "💻📱";
			default:
				return "";
		}
	}
}
