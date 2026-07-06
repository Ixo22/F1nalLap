import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, of, Subject } from 'rxjs';

import { RankingComponent } from './ranking.component';
import { F1ApiService } from '../../services/f1-api.service';
import { OverlayStateService } from '../../layout/overlay-state.service';
import {
  DriverStanding,
  ConstructorStanding,
  RaceScheduleEntry,
  RaceResult,
} from '../../models/f1-api.models';

describe('RankingComponent', () => {
  let f1ApiSpy: jasmine.SpyObj<F1ApiService>;
  let queryParams$: BehaviorSubject<Record<string, string>>;

  const driverStanding: DriverStanding = {
    position: '1',
    points: '25',
    wins: '1',
    Driver: { givenName: 'Max', familyName: 'Verstappen' },
    Constructors: [{ name: 'Red Bull' }],
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

  const raceResult: RaceResult = {
    position: '1',
    Driver: { givenName: 'Max', familyName: 'Verstappen' },
    Constructor: { name: 'Red Bull' },
  };

  beforeEach(() => {
    queryParams$ = new BehaviorSubject<Record<string, string>>({});
    f1ApiSpy = jasmine.createSpyObj('F1ApiService', [
      'getDriverStandings',
      'getConstructorStandings',
      'getSeasonSchedule',
      'getRaceResults',
    ]);
    f1ApiSpy.getDriverStandings.and.returnValue(of([driverStanding]));
    f1ApiSpy.getConstructorStandings.and.returnValue(of([constructorStanding]));
    f1ApiSpy.getSeasonSchedule.and.returnValue(of([raceEntry]));
    f1ApiSpy.getRaceResults.and.returnValue(of([raceResult]));

    TestBed.configureTestingModule({
      imports: [RankingComponent],
      providers: [
        { provide: F1ApiService, useValue: f1ApiSpy },
        { provide: ActivatedRoute, useValue: { queryParams: queryParams$.asObservable() } },
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) },
      ],
    });
  });

  it('loads driver standings by default', () => {
    const fixture = TestBed.createComponent(RankingComponent);
    fixture.detectChanges();

    expect(f1ApiSpy.getDriverStandings).toHaveBeenCalledWith(2025);
    expect(fixture.componentInstance.isDrivers()).toBeTrue();
    expect(fixture.componentInstance.items()).toEqual([
      jasmine.objectContaining({ driverName: 'Max Verstappen', teamName: 'Red Bull' }),
    ]);
  });

  it('loads constructor standings when the "teams" view is requested', () => {
    const fixture = TestBed.createComponent(RankingComponent);
    fixture.detectChanges();

    queryParams$.next({ view: 'teams' });

    expect(f1ApiSpy.getConstructorStandings).toHaveBeenCalledWith(2025);
    expect(fixture.componentInstance.isDrivers()).toBeFalse();
    expect(fixture.componentInstance.items()).toEqual([
      jasmine.objectContaining({ teamName: 'Red Bull', points: '400' }),
    ]);
  });

  it('loads the season schedule with its podium when the "races" view is requested', () => {
    const fixture = TestBed.createComponent(RankingComponent);
    fixture.detectChanges();

    queryParams$.next({ view: 'races' });

    expect(f1ApiSpy.getSeasonSchedule).toHaveBeenCalledWith(2025);
    expect(f1ApiSpy.getRaceResults).toHaveBeenCalledWith(2025, '1');
    expect(fixture.componentInstance.carreras()).toEqual([
      jasmine.objectContaining({
        round: '1',
        race: 'Australia Grand Prix',
        podium: [{ position: '1', driver: 'Max Verstappen' }],
      }),
    ]);
  });

  it('uses a specific image URL for Franco Colapinto', () => {
    f1ApiSpy.getDriverStandings.and.returnValue(
      of([
        {
          ...driverStanding,
          Driver: { givenName: 'Franco', familyName: 'Colapinto' },
        },
      ])
    );

    const fixture = TestBed.createComponent(RankingComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.items()[0].imageUrl).toContain('colapinto.jpg');
  });

  it('opens the overlay state while the race result dialog is open, and closes it after', () => {
    const overlayState = TestBed.inject(OverlayStateService);
    const afterClosed$ = new Subject<void>();
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    dialogRefSpy.afterClosed.and.returnValue(afterClosed$.asObservable());
    const dialogSpy = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    dialogSpy.open.and.returnValue(dialogRefSpy);
    f1ApiSpy.getRaceResults.and.returnValue(of([raceResult]));

    const fixture = TestBed.createComponent(RankingComponent);
    fixture.detectChanges();

    fixture.componentInstance.openDialog('1', 'Australia Grand Prix');
    expect(overlayState.isOpen()).toBeTrue();

    afterClosed$.next();
    expect(overlayState.isOpen()).toBeFalse();
  });
});
