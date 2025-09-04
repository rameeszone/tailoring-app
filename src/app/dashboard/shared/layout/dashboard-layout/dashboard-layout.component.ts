import { Component, Input, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Subscription } from "rxjs";
import { AuthService } from "../../../../auth/auth.service";
import { DashboardHeaderComponent } from "../dashboard-header/dashboard-header.component";
import { MobileHeaderComponent } from "../mobile-header/mobile-header.component";
import { SidebarComponent } from '../sidebar/sidebar.component';
import { User, UserRole } from "../../../../shared/models/user";

@Component({
	selector: "app-dashboard-layout",
	standalone: true,
	imports: [CommonModule, DashboardHeaderComponent, MobileHeaderComponent, SidebarComponent],
	templateUrl: "./dashboard-layout.component.html",
	styleUrl: "./dashboard-layout.component.scss"
})
export class DashboardLayoutComponent implements OnInit, OnDestroy {
	@Input() currentRole!: UserRole;
	@Input() pageTitle!: string;
	@Input() isMobileOptimized: boolean = false;

	currentUser: User | null = null;
	hasMultipleRoles: boolean = false;
sidebarCollapsed: boolean = false;

	private subscriptions = new Subscription();

	constructor(private authService: AuthService) {}

	ngOnInit(): void {
		// Get current user and determine if they have multiple roles
		this.currentUser = this.authService.getCurrentUser();
		this.hasMultipleRoles = (this.currentUser?.roles?.length || 0) > 1;
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	get layoutClass(): string {
		return this.isMobileOptimized ? "mobile-layout" : "desktop-layout";
	}

	  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
	  }

	  onSidebarCollapseChange(collapsed: boolean): void {
  this.sidebarCollapsed = collapsed;
}
}
