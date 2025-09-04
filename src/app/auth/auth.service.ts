import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, throwError } from "rxjs";
import { tap, catchError, switchMap, map } from "rxjs/operators";
import { Router } from "@angular/router";
import { jwtDecode } from "jwt-decode";

import { User, LoginRequest, UserRole } from "../shared/models/user";
import { environment } from "../../environments/environment";
import { ApiResponse } from "../shared/models/api-response";
import { AuthResponse } from "../shared/models/auth-response";
import { ApiErrorService } from "../shared/services/api-error.service";

interface JwtPayload {
	sub: string;
	user_id: string;
	roles: UserRole[];
	erpToken: string;
	iat: number;
	exp: number;
}

@Injectable({
	providedIn: "root"
})
export class AuthService {
	private readonly API_URL = environment.apiUrl;
	private readonly ACCESS_TOKEN_KEY = "dt_access_token";
	private readonly REFRESH_TOKEN_KEY = "dt_refresh_token";

	private currentUserSubject = new BehaviorSubject<User | null>(null);
	public currentUser$ = this.currentUserSubject.asObservable();

	private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
	public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

	constructor(
		private http: HttpClient,
		private router: Router,
		private apiErrorService: ApiErrorService
	) {
		// Initialize authentication state on service creation
		this.initializeAuthState();
	}

	/**
	 * Initialize authentication state from stored tokens
	 */
	private initializeAuthState(): void {
		const token = this.getAccessToken();
		if (token && this.isTokenValid(token)) {
			this.loadUserProfile();
		} else {
			this.clearAuthState();
		}
	}

	/**
	 * Login user with username and password
	 */
	login(credentials: LoginRequest): Observable<ApiResponse<AuthResponse>> {
		return this.http
			.post<
				ApiResponse<AuthResponse>
			>(`${this.API_URL}/auth/login`, credentials)
			.pipe(
				tap((response) => {
					// Extract tokens from the standard API response wrapper
					const tokens = response.data;
					this.storeTokens(tokens.accessToken, tokens.refreshToken);
				}),
				// Chain the profile loading to complete before login observable completes
				switchMap((response) => {
					return this.loadUserProfileAsync().pipe(
						map(() => response) // Return the original login response
					);
				}),
				catchError(error => this.apiErrorService.handleError(error, "Login"))
			);
	}

	/**
	 * Refresh access token using refresh token
	 */
	refreshToken(): Observable<ApiResponse<AuthResponse>> {
		const refreshToken = this.getRefreshToken();

		if (!refreshToken) {
			return throwError(() => new Error("No refresh token available"));
		}

		return this.http
			.post<
				ApiResponse<AuthResponse>
			>(`${this.API_URL}/auth/refresh`, { refreshToken })
			.pipe(
				tap((response) => {
					const tokens = response.data;
					this.storeTokens(tokens.accessToken, tokens.refreshToken);
					console.log("Tokens refreshed successfully");
				}),
				catchError((error) => {
					this.clearAuthState();
					this.router.navigate(["/auth/login"]);
					return this.apiErrorService.handleError(error, "Token Refresh");
				})
			);
	}

	/**
	 * Logout user and clear all auth data
	 */
	logout(): Observable<any> {
		return this.http.post(`${this.API_URL}/auth/logout`, {}).pipe(
			tap(() => {
				this.clearAuthState();
				this.router.navigate(["/auth/login"]);
			}),
			catchError((error) => {
				// Even if logout API fails, still navigate to login
				this.clearAuthState();
				this.router.navigate(["/auth/login"]);
				return this.apiErrorService.handleError(error, "Logout");
			})
		);
	}

	/**
	 * Load user profile and return observable (for chaining)
	 */
	private loadUserProfileAsync(): Observable<User> {
		return this.http
			.get<ApiResponse<User>>(`${this.API_URL}/auth/profile`)
			.pipe(
				tap((response) => {
					// Extract user data from API response wrapper
					const user = response.data;
					this.currentUserSubject.next(user);
					this.isAuthenticatedSubject.next(true);
				}),
				map((response) => response.data),
				catchError((error) => {
					this.clearAuthState();
					return this.apiErrorService.handleError(error, "User Profile");
				})
			);
	}

	/**
	 * Load current user profile
	 */
	private loadUserProfile(): void {
		this.loadUserProfileAsync().subscribe();
	}

	/**
	 * Store tokens in localStorage
	 */
	private storeTokens(accessToken: string, refreshToken: string): void {
		localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
		localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
	}

	/**
	 * Get stored access token
	 */
	getAccessToken(): string | null {
		return localStorage.getItem(this.ACCESS_TOKEN_KEY);
	}

	/**
	 * Get stored refresh token
	 */
	private getRefreshToken(): string | null {
		return localStorage.getItem(this.REFRESH_TOKEN_KEY);
	}

	/**
	 * Check if token is valid (not expired)
	 */
	private isTokenValid(token: string): boolean {
		try {
			const decoded: JwtPayload = jwtDecode(token);
			const currentTime = Date.now() / 1000;
			return decoded.exp > currentTime;
		} catch {
			return false;
		}
	}

	/**
	 * Get current user
	 */
	getCurrentUser(): User | null {
		return this.currentUserSubject.value;
	}

	/**
	 * Check if user is authenticated
	 */
	isAuthenticated(): boolean {
		const token = this.getAccessToken();
		return token !== null && this.isTokenValid(token);
	}

	/**
	 * Check if user has specific role
	 */
	hasRole(role: UserRole): boolean {
		const user = this.getCurrentUser();
		return user?.roles?.includes(role) || false;
	}

	/**
	 * Clear authentication state
	 */
	private clearAuthState(): void {
		localStorage.removeItem(this.ACCESS_TOKEN_KEY);
		localStorage.removeItem(this.REFRESH_TOKEN_KEY);
		sessionStorage.removeItem("selected_role");
		this.currentUserSubject.next(null);
		this.isAuthenticatedSubject.next(false);
	}
}
