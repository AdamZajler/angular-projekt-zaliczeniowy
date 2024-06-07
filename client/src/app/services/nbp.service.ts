import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {firstValueFrom, Observable} from 'rxjs';
import {getNBPApiUrl} from "../../helpers/getNBPApiUrl";
import {getFirstAndLastDayOfCurrentYear} from "../../helpers/getFirstAndLastDayOfCurrentYear";
import {availableCurrencies} from "../../consts/availableCurrencies";

@Injectable({
  providedIn: 'root'
})
export class NbpService {
  constructor(private http: HttpClient) { }

  // Pobieranie kursu za określony zakres dat
  getRates(startDate: string, endDate: string, crr: string): Observable<any> {
    const url = `${getNBPApiUrl(crr)}/${startDate}/${endDate}/?format=json`;
    return this.http.get<any>(url);
  }

  async synchronizeAllRatesInDB() {
    const { firstDay, lastDay } = getFirstAndLastDayOfCurrentYear();

    const rates = await Promise.all(availableCurrencies.map((currency) => {
      return firstValueFrom(this.getRates(firstDay, lastDay, currency));
    }));

    const ratesParsed = rates.map(({ code, rates }) => ({
      nazwa_waluty: code,
      data_synchronizacji: new Date().toLocaleString(),
      kurs: JSON.stringify(rates)
    }));

    await firstValueFrom(this.postRatesToDB(ratesParsed));

    console.log("RATES: ", rates);
    console.log("ratesParsed: ", ratesParsed);
  }

  getRatesFromDB(type: string): Observable<any> {
    const url = `http://localhost:8000/data/`;
    return this.http.get<any>(url);
  }

  postRatesToDB(data: any[]): Observable<any> {
    const url = `http://localhost:8000/data/`;
    return this.http.post<any>(url, data);
  }
}
