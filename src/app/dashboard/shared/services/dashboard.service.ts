import { Injectable } from "@angular/core";
import { UserRole } from "../../../shared/models/user";

interface RoleConfig {
	role: UserRole;
	title: string;
	route: string;
	icon: string;
	isMobileOptimized: boolean;
	deviceType: "desktop" | "mobile" | "both";
}

@Injectable({
	providedIn: "root"
})
export class DashboardService {
	private readonly roleConfigs: { [key in UserRole]: RoleConfig } = {
		[UserRole.SUPERVISOR]: {
			role: UserRole.SUPERVISOR,
			title: "Supervisor Dashboard",
			route: "/dashboard/supervisor",
			icon: "👨‍💼",
			isMobileOptimized: false,
			deviceType: "desktop"
		},
		[UserRole.CASHIER]: {
			role: UserRole.CASHIER,
			title: "Cashier Dashboard",
			route: "/dashboard/cashier",
			icon: "💳",
			isMobileOptimized: false,
			deviceType: "desktop"
		},
		[UserRole.BRANCH_TAILOR]: {
			role: UserRole.BRANCH_TAILOR,
			title: "Branch Tailor Dashboard",
			route: "/dashboard/branch-tailor",
			icon: "📏",
			isMobileOptimized: false,
			deviceType: "both"
		},
		[UserRole.CUTTING_MASTER]: {
			role: UserRole.CUTTING_MASTER,
			title: "Cutting Master Dashboard",
			route: "/dashboard/cutting",
			icon: "✂️",
			isMobileOptimized: true,
			deviceType: "mobile"
		},
		[UserRole.STITCHING_MASTER]: {
			role: UserRole.STITCHING_MASTER,
			title: "Stitching Master Dashboard",
			route: "/dashboard/stitching",
			icon: "🧵",
			isMobileOptimized: true,
			deviceType: "mobile"
		},
		[UserRole.IRONER_MASTER]: {
			role: UserRole.IRONER_MASTER,
			title: "Ironer Master Dashboard",
			route: "/dashboard/ironing",
			icon: "👔",
			isMobileOptimized: true,
			deviceType: "mobile"
		},
		[UserRole.PACKAGING_STAFF]: {
			role: UserRole.PACKAGING_STAFF,
			title: "Packaging Staff Dashboard",
			route: "/dashboard/packaging",
			icon: "📦",
			isMobileOptimized: true,
			deviceType: "mobile"
		},
		[UserRole.DRIVER]: {
			role: UserRole.DRIVER,
			title: "Driver Dashboard",
			route: "/dashboard/driver",
			icon: "🚚",
			isMobileOptimized: true,
			deviceType: "mobile"
		}
	};

	constructor() {}

	/**
	 * Get role configuration
	 */
	getRoleConfig(role: UserRole): RoleConfig | null {
		return this.roleConfigs[role] || null;
	}

	/**
	 * Get all role configurations
	 */
	getAllRoleConfigs(): RoleConfig[] {
		return Object.values(this.roleConfigs);
	}

	/**
	 * Check if role is mobile optimized
	 */
	isMobileOptimized(role: UserRole): boolean {
		return this.roleConfigs[role]?.isMobileOptimized || false;
	}

	/**
	 * Get dashboard title for role
	 */
	getDashboardTitle(role: UserRole): string {
		return this.roleConfigs[role]?.title || "Dashboard";
	}

	/**
	 * Get dashboard route for role
	 */
	getDashboardRoute(role: UserRole): string {
		return this.roleConfigs[role]?.route || "/dashboard";
	}

	/**
	 * Get role icon
	 */
	getRoleIcon(role: UserRole): string {
		return this.roleConfigs[role]?.icon || "📋";
	}

	/**
	 * Get current selected role from session
	 */
	getCurrentRole(): UserRole | null {
		const storedRole = sessionStorage.getItem("selected_role");
		return (storedRole as UserRole) || null;
	}

	/**
	 * Set current role in session
	 */
	setCurrentRole(role: UserRole): void {
		sessionStorage.setItem("selected_role", role);
	}

	/**
	 * Clear current role from session
	 */
	clearCurrentRole(): void {
		sessionStorage.removeItem("selected_role");
	}

	/**
	 * Format currency (utility function)
	 */
	formatCurrency(amount: number, currency: string = "USD"): string {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: currency
		}).format(amount);
	}

	/**
	 * Format date (utility function)
	 */
	formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
		const defaultOptions: Intl.DateTimeFormatOptions = {
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit"
		};

		return new Intl.DateTimeFormat("en-US", options || defaultOptions).format(
			new Date(date)
		);
	}

	/**
	 * Format relative time (e.g., "2 hours ago")
	 */
	formatRelativeTime(date: Date): string {
		const now = new Date();
		const diffInSeconds = Math.floor(
			(now.getTime() - new Date(date).getTime()) / 1000
		);

		if (diffInSeconds < 60) {
			return "Just now";
		}

		const diffInMinutes = Math.floor(diffInSeconds / 60);
		if (diffInMinutes < 60) {
			return `${diffInMinutes} min${diffInMinutes > 1 ? "s" : ""} ago`;
		}

		const diffInHours = Math.floor(diffInMinutes / 60);
		if (diffInHours < 24) {
			return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
		}

		const diffInDays = Math.floor(diffInHours / 24);
		if (diffInDays < 7) {
			return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
		}

		return this.formatDate(date);
	}
}
