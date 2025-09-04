import { ApiResponse } from './api-response';

/**
 * Core Customer Entity from ERP System
 */
export interface Customer {
  name: string;           // Customer code from ERP (primary identifier)
  customer_name: string;  // Customer display name
  mobile_no: string;      // Customer mobile number
}

/**
 * Pagination metadata for customer list
 */
export interface CustomerPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Customer list data structure (handles both list and search)
 */
export interface CustomerListData {
  customers: Customer[];
  pagination: CustomerPagination;
}

/**
 * Customer request parameters (handles both list and search)
 */
export interface CustomerListRequest {
  page: number;           // Page number (1-based)
  limit: number;          // Items per page (20)
  mobile?: string;        // Optional mobile search parameter
}

// Type alias using your existing ApiResponse<T>
export type CustomerListResponse = ApiResponse<CustomerListData>;

/**
 * Customer loading states for components
 */
export interface CustomerLoadingState {
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
}