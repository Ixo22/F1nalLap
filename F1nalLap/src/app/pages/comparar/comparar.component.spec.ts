import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { CompararComponent } from './comparar.component';
import { F1ApiService } from '../../services/f1-api.service';
import {
  ConstructorStanding,
  DriverStanding,
  RaceResult,
  RaceScheduleEntry,
} from '../../models/f1-api.models';

describe('CompararComponent', () => {
  let f1ApiSpy: jasmine.SpyObj<F1ApiService>;

  const driverStanding: DriverStanding = {
    position: '1',
    points: '25',
    wins: '1',
    Driver: { givenName: 'Max', familyName: 'Verstappen' },
    Constructors: [{ name: 'Red Bull' }],
  };
  const otroDriverStanding: DriverStanding = {
    position: '2',
    points: '18',
    wins: '0',
    Driver: { givenName: 'Lando', familyName: 'Norris' },
    Constructors: [{ name: 'McLaren' }],
  };

  const constructorStanding: ConstructorStanding = {
    position: '1',
    points: '400',
    wins: '10',
    Constructor: { name: 'Red Bull' },
  };

  const raceEntry: RaceScheduleEntry = {
    round: '1',
    raceName: 'Australia Grand Prix',
    date: '2025-03-16',
    Circuit: { circuitId: 'albert_park' },
  };

  const resultadoVerstappen: RaceResult = {
    position: '1',
    points: '25',
    Driver: { givenName: 'Max', familyName: 'Verstappen' },
    Constructor: { name: 'Red Bull' },
  };
  const resultadoNorris: RaceResult = {
    position: '2',
    points: '18',
    Driver: { givenName: 'Lando', familyName: 'Norris' },
    Constructor: { name: 'McLaren' },
  };

  beforeEach(() => {
    f1ApiSpy = jasmine.createSpyObj('F1ApiService', [
      'getDriverStandings',
      'getConstructorStandings',
      'getSeasonSchedule',
      'getRaceResults',
    ]);
    f1ApiSpy.getDriverStandings.and.returnValue(of([driverStanding, otroDriverStanding]));
    f1ApiSpy.getConstructorStandings.and.returnValue(of([constructorStanding]));
    f1ApiSpy.getSeasonSchedule.and.returnValue(of([raceEntry]));
    f1ApiSpy.getRaceResults.and.returnValue(of([resultadoVerstappen, resultadoNorris]));

    TestBed.configureTestingModule({
      imports: [CompararComponent],
      providers: [provideRouter([]), { provide: F1ApiService, useValue: f1ApiSpy }],
    });
  });

  it('does not call the API when no season has been selected yet', () => {
    const fixture = TestBed.createComponent(CompararComponent);
    fixture.detectChanges();

    expect(f1ApiSpy.getDriverStandings).not.toHaveBeenCalled();
    expect(f1ApiSpy.getConstructorStandings).not.toHaveBeenCalled();
  });

  it('loads drivers and constructors as soon as a valid season is selected', () => {
    const fixture = TestBed.createComponent(CompararComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.temporadaControl.setValue(2025);

    expect(f1ApiSpy.getDriverStandings).toHaveBeenCalledWith(2025);
    expect(f1ApiSpy.getConstructorStandings).toHaveBeenCalledWith(2025);
    expect(component.pilotos()).toEqual([
      { piloto: 'Max Verstappen', wins: '1', points: '25' },
      { piloto: 'Lando Norris', wins: '0', points: '18' },
    ]);
    expect(component.equipos()).toEqual([
      { position: '1', constructor: 'Red Bull', points: '400', wins: '10' },
    ]);
  });

  it('does not touch the API for an out-of-range season', () => {
    const fixture = TestBed.createComponent(CompararComponent);
    fixture.detectChanges();

    fixture.componentInstance.temporadaControl.setValue(1900);

    expect(f1ApiSpy.getDriverStandings).not.toHaveBeenCalled();
  });

  it('fetches per-race points once both drivers to compare are selected', () => {
    const fixture = TestBed.createComponent(CompararComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.temporadaControl.setValue(2025);
    component.piloto1Control.setValue('Max Verstappen');
    component.piloto2Control.setValue('Lando Norris');

    expect(f1ApiSpy.getSeasonSchedule).toHaveBeenCalledWith(2025);
    expect(f1ApiSpy.getRaceResults).toHaveBeenCalledWith(2025, '1');
    expect(component.puntosPorCarrera).toEqual([
      { name: 'Max Verstappen', series: [{ name: 'Australia', value: 25 }] },
      { name: 'Lando Norris', series: [{ name: 'Australia', value: 18 }] },
    ]);
    expect(component.cargandoPuntos).toBeFalse();
  });

  it('resets the comparison selection when switching modes', () => {
    const fixture = TestBed.createComponent(CompararComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.temporadaControl.setValue(2025);
    component.piloto1Control.setValue('Max Verstappen');
    component.piloto2Control.setValue('Lando Norris');
    expect(component.pilotoComparar1).not.toBeNull();

    component.activarComparar('equipos');

    expect(component.modoComparar).toBe('equipos');
    expect(component.pilotoComparar1).toBeNull();
    expect(component.pilotoComparar2).toBeNull();
    expect(component.piloto1Control.value).toBe('');
  });

  describe('chart data getters', () => {
    it('builds the wins/points series only from the currently selected drivers', () => {
      const fixture = TestBed.createComponent(CompararComponent);
      fixture.detectChanges();
      const component = fixture.componentInstance;

      component.temporadaControl.setValue(2025);
      component.piloto1Control.setValue('Max Verstappen');
      component.piloto2Control.setValue('Lando Norris');

      expect(component.pilotosVictoriasChart).toEqual([
        { name: 'Max Verstappen', value: 1 },
        { name: 'Lando Norris', value: 0 },
      ]);
      expect(component.pilotosPuntosChart).toEqual([
        { name: 'Max Verstappen', value: 25 },
        { name: 'Lando Norris', value: 18 },
      ]);
    });
  });
});
