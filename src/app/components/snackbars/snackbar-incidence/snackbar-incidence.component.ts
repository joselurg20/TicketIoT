import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBarRef } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Routes } from 'src/app/utilities/routes';

@Component({
  selector: 'app-snackbar-incidence',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatSnackBarModule, MatIconModule, TranslateModule],
  templateUrl: './snackbar-incidence.component.html',
  styleUrls: ['./snackbar-incidence.component.scss']
})
export class SnackbarIncidenceComponent {
  snackBarRef: MatSnackBarRef<SnackbarIncidenceComponent>;
  isIncidencePage: boolean = false;
  isMessagePage: boolean = false;
  isRecoveredPage: boolean = false;
  isRecovered2Page: boolean = false;

  constructor(private router: Router , private inject: MatSnackBarRef<SnackbarIncidenceComponent>) {
    this.snackBarRef = inject;
    const currentPage = this.obtenerPaginaActual(); 

    if (currentPage === Routes.incidence) {
      this.isIncidencePage = true;
    } else if ( currentPage === Routes.reviewManager || currentPage === Routes.reviewTechnician ) {
      this.isMessagePage = true;
    } else if (currentPage === Routes.recover) {
      this.isRecoveredPage = true;
    } else if (currentPage === Routes.recover2) {
      this.isRecovered2Page = true;
    }
  }

  obtenerPaginaActual(): string {
    const currentRoute = this.router.url;
    return currentRoute.split('/').pop() || '';
  }

}
