import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CountryService } from '../../services/country.service';
import { Region, SmallCountry } from '../../interfaces/country.interfaces';
import { filter, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-country-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './country-page.component.html',
  styles: ``
})
export class CountryPageComponent implements OnInit {

  private fb = inject(FormBuilder);
  private countryService = inject(CountryService);

  public myForm: FormGroup = this.fb.group({
    region: ['', [ Validators.required ]],
    country: ['', [ Validators.required ]],
    border: ['', [ Validators.required ]],
  });

  public regions: Region[] = [];
  public countriesByRegion: SmallCountry[] = [];
  public borders: SmallCountry[] = [];
  
  // New property for the table
  public borderCountries: SmallCountry[] = []; 

  ngOnInit(): void {
    this.regions = this.countryService.regions;

    this.onRegionChanged();
    this.onCountryChanged();
  }

  onRegionChanged(): void {
    this.myForm.get('region')!.valueChanges
      .pipe(
        tap( () => this.myForm.get('country')!.setValue('') ),
        tap( () => this.borders = [] ),
        tap( () => this.borderCountries = [] ),
        switchMap( (region) => this.countryService.getCountriesByRegion( region ) ),
      )
      .subscribe( countries => {
        this.countriesByRegion = countries.sort((a,b) => a.name.localeCompare(b.name));
      });
  }

  onCountryChanged(): void {
    this.myForm.get('country')!.valueChanges
      .pipe(
        tap( () => this.myForm.get('border')!.setValue('') ),
        tap( () => this.borderCountries = [] ),
        filter( (value: string) => value.length > 0 ),
        switchMap( (alphaCode) => this.countryService.getCountryByAlphaCode( alphaCode ) ),
        switchMap( (country) => this.countryService.getCountryBordersByCodes( country.borders ) )
      )
      .subscribe( countries => {
        this.borders = countries;
        this.borderCountries = countries; // store for the table
      });
  }

}
