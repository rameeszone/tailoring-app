import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { AuthService } from "../../../../auth/auth.service";
import { DashboardService } from "../../services/dashboard.service";
import { User, UserRole } from "../../../../shared/models/user";

interface RoleOption {
	role: UserRole;
	title: string;
	route: string;
	icon: string;
}

@Component({
	selector: "app-mobile-header",
	standalone: true,
	imports: [CommonModule],
	templateUrl: "./mobile-header.component.html",
	styleUrl: "./mobile-header.component.scss"
})
export class MobileHeaderComponent {
	@Input() currentRole!: UserRole;
	@Input() pageTitle!: string;
	@Input() currentUser: User | null = null;
	@Input() hasMultipleRoles: boolean = false;

	showMobileMenu = false;

	constructor(
		private authService: AuthService,
		private router: Router,
		private dashboardService: DashboardService
	) {}

	get availableRoles(): RoleOption[] {
		if (!this.currentUser?.roles) return [];

		return this.currentUser.roles
			.filter((role) => role !== this.currentRole)
			.map((role) => {
				const config = this.dashboardService.getRoleConfig(role);
				return config
					? {
							role: config.role,
							title: config.title,
							route: config.route,
							icon: config.icon
						}
					: null;
			})
			.filter(Boolean) as RoleOption[];
	}

	get currentRoleInfo(): RoleOption | null {
		const config = this.dashboardService.getRoleConfig(this.currentRole);
		return config
			? {
					role: config.role,
					title: config.title,
					route: config.route,
					icon: config.icon
				}
			: null;
	}

	toggleMobileMenu(): void {
		this.showMobileMenu = !this.showMobileMenu;
	}

	switchRole(role: UserRole): void {
		const config = this.dashboardService.getRoleConfig(role);
		if (config) {
			this.dashboardService.setCurrentRole(role);
			this.router.navigate([config.route]);
		}
		this.showMobileMenu = false;
	}

	logout(): void {
		this.authService.logout().subscribe();
	}
}
