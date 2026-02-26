import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, combineLatest, map, of } from 'rxjs';
import { Country, Region, SmallCountry } from '../interfaces/country.interfaces';

@Injectable({
  providedIn: 'root'
})
export class CountryService {

  private http = inject(HttpClient);
  private baseUrl: string = '/api';

  get regions(): Region[] {
    return [ Region.Africa, Region.Americas, Region.Asia, Region.Europe, Region.Oceania ];
  }

  getCountriesByRegion( region: string ): Observable<SmallCountry[]> {
    if ( !region ) return of([]);

    const url: string = `${ this.baseUrl }/region/${ region }?fields=alpha3Code,name,borders`;

    return this.http.get<Country[]>(url)
      .pipe(
        map( countries => countries.map( country => ({
          name: country.name,
          cca3: country.alpha3Code,
          borders: country.borders ?? []
        })))
      )
  }

  getCountryByAlphaCode( alphaCode: string ): Observable<SmallCountry> {
    const url = `${ this.baseUrl }/alpha/${ alphaCode }?fields=alpha3Code,name,borders`;
    return this.http.get<Country>(url)
      .pipe(
        map( country => ({
          name: country.name,
          cca3: country.alpha3Code,
          borders: country.borders ?? []
        }))
      );
  }

  getCountryBordersByCodes( borders: string[] ): Observable<SmallCountry[]> {
    if ( !borders || borders.length === 0 ) return of([]);

    const countriesRequests: Observable<SmallCountry>[] = [];

    borders.forEach( code => {
      const request = this.getCountryByAlphaCode( code );
      countriesRequests.push( request );
    });

    return combineLatest( countriesRequests );
  }
}
