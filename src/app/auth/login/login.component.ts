import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
	ReactiveFormsModule,
	FormBuilder,
	FormGroup,
	Validators
} from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";

import { AuthService } from "../auth.service";
import { DashboardService } from "../../dashboard/shared/services/dashboard.service";
import { LoginRequest, UserRole } from "../../shared/models/user";

@Component({
	selector: "app-login",
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule],
	templateUrl: "./login.component.html",
	styleUrl: "./login.component.scss"
})
export class LoginComponent implements OnInit {
	loginForm!: FormGroup;
	loading = false;
	error = "";

	constructor(
		private formBuilder: FormBuilder,
		private authService: AuthService,
		private dashboardService: DashboardService,
		private router: Router,
		private route: ActivatedRoute
	) {
		this.initializeForm();
	}

	ngOnInit(): void {
		if (this.authService.isAuthenticated()) {
			this.router.navigate(["/dashboard/role-selector"]);
		}
	}

	private initializeForm(): void {
		this.loginForm = this.formBuilder.group({
			username: ["", [Validators.required, Validators.email]],
			password: ["", [Validators.required, Validators.minLength(8)]]
		});
	}

	onSubmit(): void {
		// Reset error message
		this.error = "";

		// Validate form
		if (this.loginForm.invalid) {
			this.markFormGroupTouched();
			return;
		}

		const credentials: LoginRequest = {
			username: this.loginForm.get("username")!.value.trim(),
			password: this.loginForm.get("password")!.value
		};

		this.loading = true;

		this.authService.login(credentials).subscribe({
			next: () => {
            const user = this.authService.getCurrentUser();
      const storedRole = this.dashboardService.getCurrentRole();

      // Check if user has a valid stored role
      if (storedRole && user?.roles?.includes(storedRole as UserRole)) {
        // User has valid stored role, go directly to dashboard
        const dashboardRoute = this.dashboardService.getDashboardRoute(storedRole as UserRole);
        this.router.navigate([dashboardRoute]);
      } else if (user?.roles?.length === 1) {
        // Single role user, store role and go to dashboard
        const role = user.roles[0];
        this.dashboardService.setCurrentRole(role);
        const dashboardRoute = this.dashboardService.getDashboardRoute(role);
        this.router.navigate([dashboardRoute]);
      } else {
        // Multiple roles, no stored role - go to role selector
        this.router.navigate(['/dashboard/role-selector']);
      }
			},
			error: (error) => {
				console.error("Login failed:", error);
				this.loading = false;

				// Handle different error types
				if (error.status === 401) {
					this.error = "Invalid username or password. Please try again.";
				} else if (error.status === 0) {
					this.error =
						"Unable to connect to server. Please check your internet connection.";
				} else {
					this.error =
						error.error?.message || "Login failed. Please try again.";
				}
			}
		});
	}

	private markFormGroupTouched(): void {
		Object.keys(this.loginForm.controls).forEach((key) => {
			const control = this.loginForm.get(key);
			control?.markAsTouched();
		});
	}

	// Helper methods for template
	hasError(field: string, errorType: string): boolean {
		const control = this.loginForm.get(field);
		return !!(
			control?.hasError(errorType) &&
			(control?.dirty || control?.touched)
		);
	}

	getErrorMessage(field: string): string {
		const control = this.loginForm.get(field);

		if (control?.hasError("required")) {
			return `${this.getFieldDisplayName(field)} is required`;
		}

		if (control?.hasError("email")) {
			return "Please enter a valid email address";
		}

		if (control?.hasError("minlength")) {
			const minLength = control.getError("minlength")?.requiredLength;
			return `Password must be at least ${minLength} characters`;
		}

		return "";
	}

	private getFieldDisplayName(field: string): string {
		const fieldNames: { [key: string]: string } = {
			username: "Username",
			password: "Password"
		};
		return fieldNames[field] || field;
	}
}
