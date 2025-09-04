import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Customer,
  CustomerListResponse,
  CustomerListRequest
} from '../../shared/models/customer';
import { ApiErrorService } from '../../shared/services/api-error.service';
import { UserRole } from '../../shared/models/user';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private readonly API_URL = `${environment.apiUrl}/customers`;

  constructor(
    private http: HttpClient,
    private apiErrorService: ApiErrorService
  ) {}

  /**
   * Get customers with optional mobile search
   * Handles both listing and searching in single method
   */
  getCustomers(request: CustomerListRequest & { mobile?: string }): Observable<CustomerListResponse> {
    let params = new HttpParams()
      .set('page', request.page.toString())
      .set('limit', request.limit.toString());

    // Add mobile search parameter if provided
    if (request.mobile && request.mobile.trim()) {
      params = params.set('mobile', request.mobile.trim());
    }

    return this.http.get<CustomerListResponse>(`${this.API_URL}`, { params })
      .pipe(
        catchError(error => this.apiErrorService.handleError(error, 'Customer Management'))
      );
  }

  /**
   * Get single customer by code
   */
  getCustomerByCode(customerCode: string): Observable<any> {
    return this.http.get(`${this.API_URL}/${customerCode}`)
      .pipe(
        catchError(error => this.apiErrorService.handleError(error, 'Customer Details'))
      );
  }

  /**
   * Check if current user can access customer management
   */
  canAccessCustomers(userRoles: UserRole[]): boolean {
    const allowedRoles = [UserRole.SUPERVISOR, UserRole.BRANCH_TAILOR];
    return userRoles.some(role => allowedRoles.includes(role));
  }

  /**
   * Get default list request
   */
  getDefaultListRequest(): CustomerListRequest {
    return {
      page: 1,
      limit: 20
    };
  }

  /**
   * Get default search request
   */
  getSearchRequest(mobile: string, page: number = 1): CustomerListRequest & { mobile: string } {
    return {
      page: page,
      limit: 20,
      mobile: mobile
    };
  }

  /**
   * Format customer display name
   */
  getCustomerDisplayName(customer: Customer): string {
    return `${customer.customer_name} (${customer.name})`;
  }

  /**
   * Format mobile number for display
   */
  formatMobileNumber(mobile: string): string {
    if (!mobile) return '';
    
    const cleaned = mobile.replace(/\D/g, '');
    
    // Format for 8-digit numbers (adjust as needed)
    if (cleaned.length === 8) {
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
    }
    
    return mobile;
  }
}