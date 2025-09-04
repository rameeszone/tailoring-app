import { HttpInterceptorFn, HttpErrorResponse } from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, switchMap, throwError } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
	const router = inject(Router);

	// Skip adding token for login and refresh requests
	if (req.url.includes("/auth/login") || req.url.includes("/auth/refresh")) {
		return next(req);
	}

	// Get token directly from localStorage (avoid circular dependency)
	const token = localStorage.getItem("dt_access_token");

	// If no token, proceed without authorization
	if (!token) {
		return next(req);
	}

	// Add token to request headers
	const authReq = req.clone({
		setHeaders: {
			Authorization: `Bearer ${token}`
		}
	});

	return next(authReq).pipe(
		catchError((error: HttpErrorResponse) => {
			// Handle 401 Unauthorized errors
			if (error.status === 401 && !req.url.includes("/auth/refresh")) {
				console.log("Token expired, attempting refresh...");

				const refreshToken = localStorage.getItem("dt_refresh_token");
				if (!refreshToken) {
					// No refresh token, redirect to login
					localStorage.clear();
					router.navigate(["/auth/login"]);
					return throwError(() => error);
				}

				// Create a separate HttpClient instance to avoid circular dependency
				const http = inject(HttpClient);

				// Attempt to refresh token
				return http
					.post<any>(`${environment.apiUrl}/auth/refresh`, { refreshToken })
					.pipe(
						switchMap((response) => {
							// Store new tokens
							const tokens = response.data;
							localStorage.setItem("dt_access_token", tokens.accessToken);
							localStorage.setItem("dt_refresh_token", tokens.refreshToken);

							// Retry original request with new token
							const retryReq = req.clone({
								setHeaders: {
									Authorization: `Bearer ${tokens.accessToken}`
								}
							});
							console.log("Retrying request with new token");
							return next(retryReq);
						}),
						catchError((refreshError) => {
							// Refresh failed, clear storage and redirect to login
							console.error("Token refresh failed, redirecting to login");
							localStorage.clear();
							router.navigate(["/auth/login"]);
							return throwError(() => refreshError);
						})
					);
			}

			return throwError(() => error);
		})
	);
};
