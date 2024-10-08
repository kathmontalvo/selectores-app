import { Injectable } from '@angular/core';
import { Country, Region, SmallCountry } from '../interfaces/country.interfaces';
import { combineLatest, map, Observable, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CountriesService {

  private BASE_URL: string = 'https://restcountries.com/v3.1'

  private _regions: Region[] = [ Region.Africa, Region.Americas, Region.Asia, Region.Europe, Region.Oceania ];

  constructor(
    private http: HttpClient,
  ) { }

  get regions():Region[] {
    return [ ...this._regions ]
  }

  getCountriesByRegion(region: Region): Observable<SmallCountry[]> {

    if(!region) return of([]);

    const url = `${this.BASE_URL}/region/${region}?fields=cca3,name,borders`;

    return this.http.get<Country[]>(url)
    .pipe(
      map( countries => countries.map( country => ({
        name: country.name.common ,
        cca3: country.cca3,
        borders: country.borders ?? [],
      }))),
      tap(countries => {
        return countries.sort(( a, b ) => a.name.localeCompare(b.name))
      })
    )

  }

  getCountryByCode(alphaCode: string): Observable<SmallCountry> {

    const url = `${this.BASE_URL}/alpha/${alphaCode}?fields=cca3,name,borders`;

    return this.http.get<Country>(url)
    .pipe(
      map( country => ({
        name: country.name.common ,
        cca3: country.cca3,
        borders: country.borders ?? [],
      })),
    )

  }

  getCountryBordersByCodes( borders: string[] ): Observable<SmallCountry[]> {

    if( !borders || borders.length < 0 ) return of([]);

    const countriesRequest: Observable<SmallCountry>[] = [];

    borders.forEach( code => {
      const request = this.getCountryByCode(code);
      countriesRequest.push(request);
    })

    return combineLatest( countriesRequest );
  }

}
