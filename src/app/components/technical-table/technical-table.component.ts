import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { iUserTable } from 'src/app/models/users/iUserTable';
import { ApiService } from 'src/app/services/api.service';


@Component({
  selector: 'app-technical-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, TranslateModule],
  templateUrl: './technical-table.component.html',
  styleUrls: ['./technical-table.component.scss']
})
export class TechnicalTableComponent implements OnInit {
  users: iUserTable[] = [];

  constructor(private apiService: ApiService, private translate: TranslateService) {
    this.translate.addLangs(['en', 'es']);
    const lang = this.translate.getBrowserLang();
    if (lang !== 'en' && lang !== 'es') {
      this.translate.setDefaultLang('en');
    } else {
      this.translate.use('es');
    }
  }
  ngOnInit(): void {
    this.apiService.getUsers().subscribe({
      next: (response: any) => {
        const users: iUserTable[] = response.map((value: any) => {
          return {
            id: value.id,
            userName: value.fullName,
            email: value.email,
            phoneNumber: value.phoneNumber
          };
        });
        this.users = users;
      },
      error: (error) => {
        console.error(error);
      }
    });
  }
}
