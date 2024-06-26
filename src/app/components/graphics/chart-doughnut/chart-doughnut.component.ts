import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { Observable, Subscription } from 'rxjs';
import { iTicketGraph } from 'src/app/models/tickets/iTicketsGraph';
import { ComponentLoadService } from 'src/app/services/componentLoad.service';
import { LanguageUpdateService } from 'src/app/services/languageUpdateService';
import { LoadingService } from 'src/app/services/loading.service';
import { TicketDataService } from 'src/app/services/tickets/ticketData.service';
import { UsersService } from 'src/app/services/users/users.service';
import { Status } from 'src/app/utilities/enum';
import { LocalStorageKeys, Roles } from 'src/app/utilities/literals';
import { LoadingComponent } from "../../shared/loading/loading.component";

@Component({
  selector: 'app-chart-doughnut',
  standalone: true,
  imports: [CommonModule, LoadingComponent],
  templateUrl: './chart-doughnut.component.html',
  styleUrls: ['./chart-doughnut.component.scss']
})
export class ChartDoughnutComponent implements OnInit, OnDestroy {

  tickets: iTicketGraph[] = [];
  myChart: any;
  titleEs: string = 'Incidencias por estado';
  titleEn: string = 'Tickets by status';
  title: string = this.titleEs;
  labelsEs: string[] = ['ABIERTA', 'PAUSADA', 'PENDIENTE'];
  labelsEn: string[] = ['OPENED', 'PAUSED', 'PENDING'];
  labels: string[] = this.labelsEs;
  labelEs: string = 'Incidencias';
  labelEn: string = 'Tickets';
  label: string = this.labelEs;
  loading$: Observable<boolean>;
  private langUpdateSubscription: Subscription = Subscription.EMPTY;
  isFirstLoad: boolean = true;

  componentLoadSubscription: Subscription = Subscription.EMPTY;
  ticketsSubscription: Subscription = Subscription.EMPTY;

  constructor(private langUpdateService: LanguageUpdateService, private ticketsService: TicketDataService,
    private loadingService: LoadingService, private usersService: UsersService,
    private componentLoadService: ComponentLoadService) {
    this.loading$ = this.loadingService.loading$;
  }

  ngOnInit() {
    this.loadingService.showLoading();
    this.switchLanguage();
    this.componentLoadSubscription = this.componentLoadService.loadComponent$.subscribe(() => {

      if (localStorage.getItem(LocalStorageKeys.selectedLanguage) == 'en') {
        this.title = this.titleEn;
        this.label = this.labelEn;
        if (this.usersService.currentUser?.role === Roles.managerRole) {
          this.labels = this.labelsEn;
        } else {
          this.labels = ['OPENED', 'PAUSED'];
        }
      } else if (localStorage.getItem(LocalStorageKeys.selectedLanguage) == 'es') {
        this.title = this.titleEs;
        this.label = this.labelEs;
        if (this.usersService.currentUser?.role === Roles.managerRole) {
          this.labels = this.labelsEs;
        } else {
          this.labels = ['ABIERTA', 'PAUSADA'];
        }
      }
      this.createChart();
    });
    this.ticketsSubscription = this.ticketsService.ticketGraphs$.subscribe(tickets => {
      this.loadingService.showLoading();
      this.tickets = tickets;
      this.createChart();
      this.loadingService.hideLoading();
    });
    this.langUpdateSubscription = this.langUpdateService.langUpdated$.subscribe(() => {
      this.loadingService.showLoading();
      this.switchLanguage();
      this.loadingService.hideLoading();
    });
  }

  ngOnDestroy() {
    this.componentLoadSubscription.unsubscribe();
    this.ticketsSubscription.unsubscribe();
    this.langUpdateSubscription.unsubscribe();
  }

  /**
   * Cambia el idioma del título
   */
  switchLanguage() {
    if (localStorage.getItem(LocalStorageKeys.selectedLanguage) == 'en') {
      this.title = this.titleEn;
      this.label = this.labelEn;
      if (this.usersService.currentUser?.role === Roles.managerRole) {
        this.labels = this.labelsEn;
      } else {
        this.labels = ['OPENED', 'PAUSED'];
      }
    } else if (localStorage.getItem(LocalStorageKeys.selectedLanguage) == 'es') {
      this.title = this.titleEs;
      this.label = this.labelEs;
      if (this.usersService.currentUser?.role === Roles.managerRole) {
        this.labels = this.labelsEs;
      } else {
        this.labels = ['ABIERTA', 'PAUSADA'];
      }
    }
    this.createChart();
  }

  /**
   * Crea el gráfico.
   */
  createChart(): void {
    var chartExist = Chart.getChart("technicianChart2");
    if (chartExist != undefined)
      chartExist.destroy();
    if (this.myChart)
      this.myChart.destroy();

    var status: Status[] = [];
    if (this.usersService.currentUser?.role === Roles.managerRole) {
      status = [1, 2, 0];
    } else {
      status = [1, 2];
    }

    const incidentCounts = status.map(status => {
      return this.tickets.filter((ticket: { status: Status; }) => ticket.status === status).length;
    });

    Chart.register(...registerables);

    const ctx = document.getElementById('technicianChart2') as HTMLCanvasElement;
    this.myChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: this.labels,
        datasets: [{
          label: this.label,
          data: incidentCounts,
          backgroundColor: [
            'rgba(59, 235, 151, 1)',
            '#e06236',
            'grey'
          ],
          borderColor: [
            'black',
            'black',
            'black'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: {
              color: 'white',
              font: {
                size: 10
              },
              boxWidth: 15
            }
          },
          title: {
            display: true,
            text: this.title,
            color: '#EFB810',
            font: {
              size: 20
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              display: false
            },
            ticks: {
              display: false
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              display: false
            }
          }
        },

      }
    });
  }
}
