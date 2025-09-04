export enum UserRole {
	CASHIER = "Cashier",
	DRIVER = "Driver",
	STITCHING_MASTER = "Stitching Master",
	SUPERVISOR = "Supervisor",
	CUTTING_MASTER = "Cutting Master",
	IRONER_MASTER = "Ironer Master",
	PACKAGING_STAFF = "Packaging Staff",
	BRANCH_TAILOR = "Branch Tailor"
}

export interface User {
	_id: string;
	user_id: string;
	employee_name: string;
	roles: UserRole[];
	designation?: string;
	department?: string;
	company?: string;
	branch?: string;
	branch_code?: string;
	lastLoggedInAt?: Date;
	lastSyncedAt?: Date;
}

export interface LoginRequest {
	username: string;
	password: string;
}
