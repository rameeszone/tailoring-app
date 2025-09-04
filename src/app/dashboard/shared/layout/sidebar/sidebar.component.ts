import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { SidebarService } from './sidebar.service';
import { SidebarModule } from '../../../../shared/models/sidebar-module';
import { User, UserRole } from '../../../../shared/models/user';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() currentRole!: UserRole;
  @Input() currentUser: User | null = null;
  @Input() collapsed: boolean = false;
  @Output() collapseChange = new EventEmitter<boolean>();

  modules: SidebarModule[] = [];
  private subscription = new Subscription();

  constructor(private sidebarService: SidebarService) {}

  ngOnInit(): void {
    this.loadModules();
    
    // Update active states when route changes
    this.subscription.add(
      this.sidebarService.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe(() => {
          this.loadModules();
        })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private loadModules(): void {
    this.modules = this.sidebarService.getModulesForRole(this.currentRole);
  }

  get roleTitle(): string {
    const roleNames = {
      [UserRole.CASHIER]: 'Cashier Dashboard',
      [UserRole.SUPERVISOR]: 'Supervisor Dashboard', 
      [UserRole.BRANCH_TAILOR]: 'Branch Tailor Dashboard',
      [UserRole.CUTTING_MASTER]: 'Cutting Master',
      [UserRole.STITCHING_MASTER]: 'Stitching Master',
      [UserRole.IRONER_MASTER]: 'Ironer Master',
      [UserRole.PACKAGING_STAFF]: 'Packaging Staff',
      [UserRole.DRIVER]: 'Driver Dashboard'
    };
    return roleNames[this.currentRole] || 'Dashboard';
  }

    toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    this.collapseChange.emit(this.collapsed); // EMIT the change
  }
}