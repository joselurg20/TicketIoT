import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { Observable, Subscription } from 'rxjs';
import { iTicketGraph } from 'src/app/models/tickets/iTicketsGraph';
import { LanguageUpdateService } from 'src/app/services/languageUpdateService';
import { LoadingService } from 'src/app/services/loading.service';
import { TicketDataService } from 'src/app/services/tickets/ticketData.service';
import { Priorities } from 'src/app/utilities/enum';
import { LocalStorageKeys } from 'src/app/utilities/literals';
import { LoadingComponent } from "../../shared/loading/loading.component";

@Component({
  selector: 'app-chart-pie',
  standalone: true,
  imports: [CommonModule, LoadingComponent],
  templateUrl: './chart-pie.component.html',
  styleUrls: ['./chart-pie.component.scss']
})

export class ChartPieComponent implements OnInit, OnDestroy {

  tickets: iTicketGraph[] = [];
  myChart: any = null;
  titleEs: string = 'Incidencias por prioridad';
  titleEn: string = 'Tickets by priority';
  title: string = this.titleEs;
  labelsEs: string[] = ['MUY ALTA', 'ALTA', 'MEDIA', 'BAJA', 'MUY BAJA', 'INDEFINIDA'];
  labelsEn: string[] = ['HIGHEST', 'HIGH', 'MEDIUM', 'LOW', 'LOWEST', 'NOT SURE'];
  labels: string[] = this.labelsEs;
  labelEs: string = 'Incidencias';
  labelEn: string = 'Tickets';
  label: string = this.labelEs;
  private langUpdateSubscription: Subscription = Subscription.EMPTY;
  loading$: Observable<boolean>;

  ticketsSubscription: Subscription = Subscription.EMPTY;

  constructor(private ticketsService: TicketDataService, private langUpdateService: LanguageUpdateService,
    private loadingService: LoadingService) {
    this.loading$ = this.loadingService.loading$;
  }

  ngOnInit() {
    this.loadingService.showLoading();
    if (localStorage.getItem(LocalStorageKeys.selectedLanguage) == 'en') {
      this.title = this.titleEn;
      this.labels = this.labelsEn;
      this.label = this.labelEn;
    } else if (localStorage.getItem(LocalStorageKeys.selectedLanguage) == 'es') {
      this.title = this.titleEs;
      this.labels = this.labelsEs;
      this.label = this.labelEs;
    }
    this.ticketsSubscription = this.ticketsService.ticketGraphs$.subscribe(tickets => {
      this.tickets = tickets;
      this.createChart();
      this.loadingService.hideLoading();
    });
    this.langUpdateSubscription = this.langUpdateService.langUpdated$.subscribe(() => {
      this.switchLanguage();
    });

  }

  ngOnDestroy() {
    this.ticketsSubscription.unsubscribe();
    this.langUpdateSubscription.unsubscribe();
  }

  /**
  * Cambia el idioma del título
  */
  switchLanguage() {
    if (localStorage.getItem(LocalStorageKeys.selectedLanguage) == 'en') {
      this.title = this.titleEn;
      this.labels = this.labelsEn;
      this.label = this.labelEn;
    } else if (localStorage.getItem(LocalStorageKeys.selectedLanguage) == 'es') {
      this.title = this.titleEs;
      this.labels = this.labelsEs;
      this.label = this.labelEs;
    }
    this.createChart();
  }

  /**
  * Crea el gráfico.
  */
  createChart(): void {
    var chartExist = Chart.getChart("technicianChart");
    if (chartExist != undefined)
      chartExist.destroy();
    if (this.myChart)
      this.myChart.destroy();

    const priorities: Priorities[] = [5, 4, 3, 2, 1, 0];

    const incidentCounts = priorities.map(prio => {
      return this.tickets.filter((ticket: { priority: Priorities; }) => ticket.priority === prio).length;
    });

    Chart.register(...registerables);

    const ctx = document.getElementById('technicianChart') as HTMLCanvasElement;
    this.myChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: this.labels,
        datasets: [{
          label: this.label,
          data: incidentCounts,
          backgroundColor: [
            '#c82337',
            '#e06236',
            '#fdb83f',
            'rgba(59, 235, 151, 1)',
            'rgba(59, 214, 235, 1)',
            'grey'
          ],
          borderColor: [
            'black',
            'black',
            'black',
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
        }
      }
    });
  }
}
