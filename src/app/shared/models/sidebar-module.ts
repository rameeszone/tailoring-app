export interface SidebarModule {
  title: string;
  route: string;
  icon: string;
  roles: string[];
  isActive?: boolean;
  isComingSoon?: boolean;
}