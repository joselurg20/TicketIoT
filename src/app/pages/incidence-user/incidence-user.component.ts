import { CommonModule, NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import * as CryptoJS from 'crypto-js';
import { Observable } from 'rxjs';
import { LoadingComponent } from 'src/app/components/shared/loading.component';
import { iMessage } from 'src/app/models/tickets/iMessage';
import { iTicketDescriptor } from 'src/app/models/tickets/iTicketDescription';
import { ApiService } from 'src/app/services/api.service';
import { LoadingService } from 'src/app/services/loading.service';
import { IncidenceDataComponent } from "../../components/incidences/incidence-data/incidence-data.component";
import { IncidenceTableComponent } from "../../components/incidences/incidence-table/incidence-table.component";
import { LenguageComponent } from "../../components/lenguage/lenguage.component";
import { ComunicationComponent } from "../../components/messages/comunication/comunication.component";
import { HelpdeskComponent } from "../../components/messages/helpdesk/helpdesk.component";
import { HistoryComponent } from "../../components/messages/history/history.component";
import { MessageComponent } from "../../components/messages/menssage/message.component";
import { LanguageUpdateService } from 'src/app/services/languageUpdateService';
@Component({
  selector: 'app-incidence-user',
  standalone: true,
  imports: [CommonModule, MatGridListModule, NgFor, IncidenceTableComponent, IncidenceDataComponent, MessageComponent, HelpdeskComponent, ComunicationComponent, HistoryComponent, LenguageComponent, TranslateModule, LoadingComponent],
  templateUrl: './incidence-user.component.html',
  styleUrls: ['./incidence-user.component.scss']
})
export class IncidenceUserComponent {
  public messages: iMessage[] = [];
  successMsg: string = "";
  ticketId: number = 0;
  public ticket = {} as iTicketDescriptor;
  public userName: string = '';
  hashedId: string = '';
  loading$: Observable<boolean>;
  ticketStatus: string = '';


  constructor(private route: ActivatedRoute, private apiService: ApiService, private languageUpdateService: LanguageUpdateService,
    private router: Router, private translate: TranslateService, private loadingService: LoadingService) {
    this.translate.addLangs(['en', 'es']);
    const lang = this.translate.getBrowserLang();
    if (lang !== 'en' && lang !== 'es') {
      this.translate.setDefaultLang('en');
    } else {
      this.translate.use('es');
    }
    this.loading$ = this.loadingService.loading$;
  }
  ngOnInit(): void {
    this.loadingService.showLoading();
    this.route.params.subscribe(params => {
      this.ticketId = params['ticketId'];
      this.hashedId = params['hashedId'];
      const hashedId = CryptoJS.SHA256(this.ticketId.toString()).toString();
      if (this.hashedId !== hashedId) {
        this.router.navigate(['/404']);
      }
    });
    this.apiService.getTicketById(this.ticketId).subscribe({
      next: (response: any) => {
        this.ticket = {
          id: response.id,
          title: response.title,
          name: response.name,
          email: response.email,
          timestamp: response.timestamp,
          priority: response.priority,
          status: response.status,
          userId: response.userId,
          userName: ""
        }
        this.userName = this.ticket.name;
        this.ticketStatus = this.getStatusString(this.ticket.status);
        this.loadingService.hideLoading();
      },

      error: (error: any) => {
        console.error('Error al obtener el usuario', error);
      }
    });
    this.languageUpdateService.langUpdated$.subscribe(() => {
      this.ticketStatus = this.getStatusString(this.ticket.status);
    });
  }

  getStatusString(status: number): string {
    if (localStorage.getItem('selectedLanguage') == 'en') {
      switch (status) {
        case 1:
          return 'OPENED';
        case 2:
          return 'PAUSED';
        case 3:
          return 'FINISHED';
        default:
          return 'PENDING';
      }
    } else if (localStorage.getItem('selectedLanguage') == 'es') {
      switch (status) {
        case 1:
          return 'ABIERTA';
        case 2:
          return 'PAUSADA';
        case 3:
          return 'TERMINADA';
        default:
          return 'PENDIENTE';
      }
    }
    return '';
  }
}