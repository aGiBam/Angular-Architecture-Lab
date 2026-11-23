import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';

export const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    title: 'Dashboard | Angular Architecture Lab'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
