import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { AuthService } from '../../../auth/auth.service';
import { CustomerService } from '../customer.service';
import { RoleGuardService } from "./../../../shared/services/role-guard.service";
import { DashboardLayoutComponent } from '../../shared/layout/dashboard-layout/dashboard-layout.component';
import { 
  Customer, 
  CustomerListData,
  CustomerLoadingState 
} from '../../../shared/models/customer';
import { User, UserRole } from '../../../shared/models/user';
import { ApiError } from '../../../shared/services/api-error.service';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardLayoutComponent],
  templateUrl: './customer-list.component.html',
  styleUrl: './customer-list.component.scss'
})
export class CustomerListComponent implements OnInit, OnDestroy {
  readonly UserRole = UserRole;

  // User and permissions
  currentUser: User | null = null;
  currentRole: UserRole = UserRole.SUPERVISOR;

  // Data properties
  customers: Customer[] = [];
  currentPage = 1;
  totalPages = 0;
  totalItems = 0;
  itemsPerPage = 50;
  hasNext = false;
  hasPrevious = false;

  // Search properties
  searchTerm = '';
  isSearchMode = false;
  searchSubject = new Subject<string>();

  // Loading states
  loadingState: CustomerLoadingState = {
    isLoading: false,
    isSearching: false,
    error: null
  };

  private subscriptions = new Subscription();

  constructor(
    private authService: AuthService,
    private customerService: CustomerService,
    		private roleGuardService: RoleGuardService,
    private router: Router
  ) {}

  ngOnInit(): void {
      if (!this.roleGuardService.canAccessRole(UserRole.CASHIER)) {
    return;
  }
  
    this.currentUser = this.authService.getCurrentUser();
    this.setCurrentRole();
    this.setupSearchDebouncing();
    this.loadCustomers();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.searchSubject.complete();
  }

  get pageTitle(): string {
    return 'Customer Management';
  }

  get isMobileOptimized(): boolean {
    return false;
  }

  /**
   * Set current role based on user's roles
   */
  private setCurrentRole(): void {
    if (this.currentUser?.roles?.includes(UserRole.SUPERVISOR)) {
      this.currentRole = UserRole.SUPERVISOR;
    } else if (this.currentUser?.roles?.includes(UserRole.BRANCH_TAILOR)) {
      this.currentRole = UserRole.BRANCH_TAILOR;
    }
  }

  /**
   * Setup search input debouncing
   */
  private setupSearchDebouncing(): void {
    const searchSubscription = this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.performSearch(searchTerm);
    });

    this.subscriptions.add(searchSubscription);
  }

  /**
   * Load customers with optional search
   */
  loadCustomers(page: number = 1, mobile?: string): void {
    const isSearching = !!mobile;
    
    if (isSearching) {
      this.loadingState.isSearching = true;
    } else {
      this.loadingState.isLoading = true;
    }
    
    this.loadingState.error = null;

    const request = {
      page: page,
      limit: this.itemsPerPage,
      ...(mobile && { mobile: mobile })
    };

    const customerSubscription = this.customerService.getCustomers(request).subscribe({
      next: (response) => {
        if (response.success) {
          this.handleCustomerResponse(response.data, mobile);
        }
        this.loadingState.isLoading = false;
        this.loadingState.isSearching = false;
      },
      error: (error: ApiError) => {
        this.handleError(error);
        this.loadingState.isLoading = false;
        this.loadingState.isSearching = false;
      }
    });

    this.subscriptions.add(customerSubscription);
  }

  /**
   * Handle search input
   */
  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const searchTerm = target.value.trim();
    
    if (searchTerm.length === 0) {
      this.clearSearch();
      return;
    }

    if (searchTerm.length >= 2) {
      this.searchSubject.next(searchTerm);
    }
  }

  /**
   * Perform customer search
   */
  performSearch(searchTerm: string): void {
    if (!searchTerm || searchTerm.length < 2) return;
    
    this.searchTerm = searchTerm;
    this.isSearchMode = true;
    this.loadCustomers(1, searchTerm);
  }

  /**
   * Clear search and return to customer list
   */
  clearSearch(): void {
    this.searchTerm = '';
    this.isSearchMode = false;
    this.loadCustomers(1);
  }

  /**
   * Handle customer response (both list and search)
   */
  private handleCustomerResponse(data: CustomerListData, searchTerm?: string): void {
    this.customers = data.customers;
    this.updatePaginationData(data.pagination);
    
    if (searchTerm) {
      this.searchTerm = searchTerm;
      this.isSearchMode = true;
    } else {
      this.isSearchMode = false;
    }
  }

  /**
   * Update pagination data
   */
  private updatePaginationData(pagination: any): void {
    this.currentPage = pagination.currentPage;
    this.totalPages = pagination.totalPages;
    this.totalItems = pagination.totalItems;
    this.itemsPerPage = pagination.itemsPerPage;
    this.hasNext = pagination.hasNext;
    this.hasPrevious = pagination.hasPrevious;
  }

  /**
   * Handle pagination navigation
   */
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    
    if (this.isSearchMode && this.searchTerm) {
      this.loadCustomers(page, this.searchTerm);
    } else {
      this.loadCustomers(page);
    }
  }

  /**
   * Handle API errors
   */
  private handleError(error: ApiError): void {
    this.loadingState.error = error.message;
    console.error('Customer List Error:', error);
  }

  /**
   * Get pagination info text
   */
  getPaginationInfo(): string {
    if (this.totalItems === 0) return 'No customers found';
    
    const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
    const endItem = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    
    return `Showing ${startItem}-${endItem} of ${this.totalItems} customers`;
  }

  /**
   * Format customer display name
   */
  getCustomerDisplayName(customer: Customer): string {
    return this.customerService.getCustomerDisplayName(customer);
  }

  /**
   * Format mobile number
   */
  formatMobileNumber(mobile: string): string {
    return this.customerService.formatMobileNumber(mobile);
  }

  /**
 * Track by function for ngFor performance
 */
trackByCustomerCode(index: number, customer: Customer): string {
  return customer.name; // Customer code
}

/**
 * Get visible page numbers for pagination
 */
getVisiblePages(): number[] {
  const delta = 2; // Show 2 pages before and after current page
  const range = [];
  const rangeWithDots = [];

  for (let i = Math.max(2, this.currentPage - delta); 
       i <= Math.min(this.totalPages - 1, this.currentPage + delta); 
       i++) {
    range.push(i);
  }

  if (this.currentPage - delta > 2) {
    rangeWithDots.push(1, -1); // -1 represents dots
  } else {
    rangeWithDots.push(1);
  }

  rangeWithDots.push(...range);

  if (this.currentPage + delta < this.totalPages - 1) {
    rangeWithDots.push(-1, this.totalPages); // -1 represents dots
  } else {
    rangeWithDots.push(this.totalPages);
  }

  return rangeWithDots.filter(page => page > 0); // Remove dots for now (simplify)
}

  /**
   * Handle customer selection
   */
  selectCustomer(customer: Customer): void {
    console.log('Customer selected:', customer);
  }
}