import { Component, OnInit } from '@angular/core';
import { NbpService } from './services/nbp.service';
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {availableCurrencies} from "../consts/availableCurrencies";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = "";

  selectedCurrency = 'EUR';
  currencies = availableCurrencies; // Lista dostępnych walut

  dayRates: any;
  monthsRates: any;
  quarterRates: any;
  yearRates: any;

  constructor(private nbpService: NbpService) { }

  ngOnInit() {
    // Wywołujemy funkcję loadRates z początkową wartością wybranej waluty
    this.loadRates(this.selectedCurrency);
  }

  synchronizeRates() {
    this.nbpService.synchronizeAllRatesInDB();
  }

  loadRates(currency: string) {
    this.nbpService.getRatesFromDB(currency).subscribe(data => {
      if (data.length  === 0) {
        this.synchronizeRates();
      }

      this.title = data[0].nazwa_waluty;

      const dataParsed  = JSON.parse(data[0].kurs);
      this.yearRates = dataParsed;

      const lastMonthDayCount = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()

      this.dayRates = dataParsed.slice(-1);
      this.monthsRates = dataParsed.slice(0, lastMonthDayCount);
      this.quarterRates = dataParsed.slice(0, lastMonthDayCount === 30 ? (2*30)+31 : lastMonthDayCount === 28 ? 28+30+31 : (2*31)+30);
    });
  }
}
