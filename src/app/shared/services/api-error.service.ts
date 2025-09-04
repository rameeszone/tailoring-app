import { Injectable } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { environment } from "../../../environments/environment";

export interface ApiError {
  success: false;
  message: string;
  statusCode: number;
  error?: string;
  timestamp: string;
}

@Injectable({
  providedIn: "root"
})
export class ApiErrorService {
  constructor() {}

  /**
   * Handle HTTP errors and return standardized error format
   * @param error - HTTP error response
   * @param context - Optional context for better error messages
   * @returns Observable<never>
   */
  handleError(error: HttpErrorResponse, context?: string): Observable<never> {
    console.error(`API Error ${context ? `[${context}]` : ""}:`, error);

    const apiError: ApiError = {
      success: false,
      message: this.getErrorMessage(error, context),
      statusCode: error.status || 500,
      error: error.error?.error || error.name,
      timestamp: new Date().toISOString()
    };

    // Log to console for debugging
    this.logError(apiError, context);

    return throwError(() => apiError);
  }

  /**
   * Get user-friendly error message based on HTTP status and response
   * @param error - HTTP error response
   * @param context - Optional context
   * @returns User-friendly error message
   */
  private getErrorMessage(error: HttpErrorResponse, context?: string): string {
    // Check if server returned a custom message
    if (error.error?.message) {
      return error.error.message;
    }

    // Default messages based on status code
    switch (error.status) {
      case 0:
        return "Unable to connect to the server. Please check your internet connection.";
      
      case 400:
        return "Invalid request. Please check your input and try again.";
      
      case 401:
        return "Authentication required. Please log in again.";
      
      case 403:
        return "You do not have permission to perform this action.";
      
      case 404:
        return context 
          ? `${context} not found.` 
          : "The requested resource was not found.";
      
      case 422:
        return "The provided data is invalid. Please check and try again.";
      
      case 429:
        return "Too many requests. Please wait a moment and try again.";
      
      case 500:
        return "Internal server error. Please try again later.";
      
      case 502:
      case 503:
      case 504:
        return "Server is temporarily unavailable. Please try again later.";
      
      default:
        return `An unexpected error occurred (${error.status}). Please try again.`;
    }
  }

  /**
   * Log error details for debugging and monitoring
   * @param apiError - Formatted API error
   * @param context - Optional context
   */
  private logError(apiError: ApiError, context?: string): void {
    // Enhanced logging for development
    if (!environment.production) {
      console.group(`🚨 API Error ${context ? `[${context}]` : ""}`);
      console.error("Message:", apiError.message);
      console.error("Status Code:", apiError.statusCode);
      console.error("Error:", apiError.error);
      console.error("Timestamp:", apiError.timestamp);
      console.groupEnd();
    }

    // TODO: Add your logging service here (e.g., send to monitoring service)
    // this.loggingService.logError(apiError, context);
  }

  /**
   * Check if error is a network connectivity issue
   * @param error - API error
   * @returns boolean
   */
  isNetworkError(error: ApiError): boolean {
    return error.statusCode === 0;
  }

  /**
   * Check if error is an authentication issue
   * @param error - API error
   * @returns boolean
   */
  isAuthError(error: ApiError): boolean {
    return error.statusCode === 401;
  }

  /**
   * Check if error is a permission issue
   * @param error - API error
   * @returns boolean
   */
  isPermissionError(error: ApiError): boolean {
    return error.statusCode === 403;
  }

  /**
   * Check if error is a validation issue
   * @param error - API error
   * @returns boolean
   */
  isValidationError(error: ApiError): boolean {
    return error.statusCode === 400 || error.statusCode === 422;
  }

  /**
   * Check if error is a server issue
   * @param error - API error
   * @returns boolean
   */
  isServerError(error: ApiError): boolean {
    return error.statusCode >= 500;
  }
}