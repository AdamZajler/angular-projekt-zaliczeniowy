import { Component, OnInit } from '@angular/core';
import { NbpService } from './services/nbp.service';
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'kursy-nbp';

  selectedCurrency = '';

  rates: any;

  constructor(private nbpService: NbpService) { }

  ngOnInit() {
    // Przykładowy zakres dat: od 2023-01-01 do 2023-12-31
    this.nbpService.getRates('2024-01-01', new Date().toISOString().split('T')[0]
    ).subscribe(data => {
      this.rates = data;
      console.log(this.rates);
    });
  }
}
