import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CountriesService } from '../../services/countries.service';
import { Region, SmallCountry } from '../../interfaces/country.interfaces';
import { filter, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html',
  styles: ``
})
export class SelectorPageComponent implements OnInit {

  public countriesByRegion: SmallCountry[] = [];
  public borders: SmallCountry[] = [];

  public myForm: FormGroup = this.fb.group({
    region: ['', Validators.required],
    country: ['', Validators.required],
    border: ['', Validators.required],
  })

  constructor(
    private fb: FormBuilder,
    private countriesService: CountriesService,
  ) {}

  ngOnInit(): void {
    this.onRegionChanged();
    this.onCountryChanged();
  }

  get regions(): Region[] {
    return this.countriesService.regions;
  }

  onRegionChanged():void {
    console.log('a');

    this.myForm.get('region')?.valueChanges
    .pipe(
      tap( () => this.myForm.get('country')!.setValue('') ),
      tap( () => this.myForm.get('border')!.setValue([]) ),
      switchMap( region => this.countriesService.getCountriesByRegion(region) )
    )
    .subscribe(
      countries => {
        this.countriesByRegion = countries
      }
    )
  }

  onCountryChanged():void {

    console.log();

    this.myForm.get('country')?.valueChanges
    .pipe(
      tap( () => this.myForm.get('border')!.setValue('') ),
      filter( (value) => value.length > 0),
      switchMap( alplhaCode => this.countriesService.getCountryByCode(alplhaCode) ),
      switchMap( country => this.countriesService.getCountryBordersByCodes( country.borders ))
    )
    .subscribe(
      countries => {
        console.log(countries);
        this.borders = countries;
      }
    )
  }
}
