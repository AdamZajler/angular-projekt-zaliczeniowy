import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NbpService {
  private apiUrl = 'http://api.nbp.pl/api/exchangerates/rates/A/EUR';

  constructor(private http: HttpClient) { }

  // Pobieranie kursu za określony zakres dat
  getRates(startDate: string, endDate: string): Observable<any> {
    const url = `${this.apiUrl}/${startDate}/${endDate}/?format=json`;
    return this.http.get<any>(url);
  }
}
