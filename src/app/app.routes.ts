import { Routes } from "@angular/router";
import { LoginComponent } from "./auth/login/login.component";
import { RoleSelectorComponent } from "./dashboard/role-selector/role-selector.component";
import { CashierComponent } from "./dashboard/cashier/cashier.component";
import { BranchTailorComponent } from "./dashboard/branch-tailor/branch-tailor.component";
import { CuttingMasterComponent } from "./dashboard/cutting-master/cutting-master.component";
import { CustomerListComponent } from "./dashboard/customer/customer-list/customer-list.component";
import { AppRedirectComponent } from "./shared/app-redirect/app-redirect.component";

export const routes: Routes = [
	{
		path: "auth/login",
		component: LoginComponent
	},
	{
		path: "dashboard/role-selector",
		component: RoleSelectorComponent
	},
	{
		path: "dashboard/cashier",
		component: CashierComponent
	},
	{
		path: "dashboard/branch-tailor",
		component: BranchTailorComponent
	},
	{
		path: "dashboard/cutting",
		component: CuttingMasterComponent
	},
	{
		path: "dashboard/customers",
		component: CustomerListComponent
	},
	{
		path: "dashboard",
		component: AppRedirectComponent
	},
	{
		path: "",
		component: AppRedirectComponent
	},
	{
		path: "**",
		component: AppRedirectComponent
	}
];