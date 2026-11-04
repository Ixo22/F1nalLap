import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import { F1ApiService, formatLapRecord } from './f1-api.service';
import { ApiDriver, ApiResult } from '../models/api.models';

describe('F1ApiService', () => {
  let service: F1ApiService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.apiBaseUrl;

  const verstappen: ApiDriver = {
    driverRef: 'max_verstappen',
    code: 'VER',
    givenName: 'Max',
    familyName: 'Verstappen',
    nationality: 'Dutch',
    permanentNumber: 1,
  };
  const redBull = { constructorRef: 'red_bull', name: 'Red Bull', nationality: 'Austrian' };
  const result: ApiResult = {
    position: 1,
    positionText: '1',
    driver: verstappen,
    constructor: redBull,
    grid: 2,
    points: 25,
    status: 'Finished',
    laps: 58,
    fastestLapTime: '1:20.235',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(F1ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('maps driver standings to the model used by the components', () => {
    let standings: unknown;
    service.getDriverStandings(2025).subscribe((s) => (standings = s));

    httpMock.expectOne(`${baseUrl}/seasons/2025/standings/drivers`).flush([
      {
        position: 1,
        positionText: '1',
        points: 437.5,
        wins: 9,
        driver: verstappen,
        constructors: [redBull],
      },
    ]);

    expect(standings).toEqual([
      {
        position: '1',
        points: '437.5',
        wins: '9',
        Driver: { givenName: 'Max', familyName: 'Verstappen' },
        Constructors: [{ name: 'Red Bull' }],
      },
    ]);
  });

  it('uses positionText when a driver has no classified position', () => {
    let position: string | undefined;
    service.getDriverStandings(1997).subscribe((s) => (position = s[0].position));

    httpMock.expectOne(`${baseUrl}/seasons/1997/standings/drivers`).flush([
      {
        position: null,
        positionText: 'D',
        points: 78,
        wins: 5,
        driver: verstappen,
        constructors: [],
      },
    ]);

    expect(position).toBe('D');
  });

  it('maps constructor standings', () => {
    let name: string | undefined;
    service.getConstructorStandings(2025).subscribe((s) => (name = s[0].Constructor.name));

    httpMock
      .expectOne(`${baseUrl}/seasons/2025/standings/constructors`)
      .flush([{ position: 1, positionText: '1', points: 666, wins: 14, constructor: redBull }]);

    expect(name).toBe('Red Bull');
  });

  it('loads a whole season of results in a single request', () => {
    let races: { round: string; Results?: { position: string; FastestLap?: unknown }[] }[] = [];
    service.getSeasonResults(2025).subscribe((r) => (races = r));

    httpMock.expectOne(`${baseUrl}/seasons/2025/results`).flush([
      {
        round: 1,
        name: 'Australian Grand Prix',
        date: '2025-03-16',
        circuitRef: 'albert_park',
        results: [result],
      },
      {
        round: 2,
        name: 'Chinese Grand Prix',
        date: '2025-03-23',
        circuitRef: 'shanghai',
        results: [],
      },
    ]);

    expect(races.length).toBe(2);
    expect(races[0].round).toBe('1');
    expect(races[0].Results?.[0].position).toBe('1');
    expect(races[0].Results?.[0].FastestLap).toEqual({ Time: { time: '1:20.235' } });
    expect(races[1].Results).toEqual([]);
  });

  it('maps race results', () => {
    let points: string | undefined;
    service.getRaceResults(2025, '1').subscribe((r) => (points = r[0].points));

    httpMock.expectOne(`${baseUrl}/seasons/2025/races/1/results`).flush([result]);

    expect(points).toBe('25');
  });

  it('maps season winners into races with a single result', () => {
    let winner: string | undefined;
    service.getSeasonWinners(2024).subscribe((r) => (winner = r[0].Results?.[0].Driver.familyName));

    httpMock.expectOne(`${baseUrl}/seasons/2024/winners`).flush([
      {
        round: 1,
        name: 'Bahrain Grand Prix',
        date: '2024-03-02',
        circuitRef: 'bahrain',
        winner: result,
      },
    ]);

    expect(winner).toBe('Verstappen');
  });

  it('maps the schedule', () => {
    let circuitId: string | undefined;
    service.getSeasonSchedule(2025).subscribe((r) => (circuitId = r[0].Circuit.circuitId));

    httpMock.expectOne(`${baseUrl}/seasons/2025/races`).flush([
      {
        season: 2025,
        round: 1,
        name: 'Australian Grand Prix',
        date: '2025-03-16',
        circuitRef: 'albert_park',
        circuitName: 'Albert Park',
      },
    ]);

    expect(circuitId).toBe('albert_park');
  });

  it('returns an empty list when the API fails', () => {
    let standings: unknown[] | undefined;
    service.getDriverStandings(2025).subscribe((s) => (standings = s));

    httpMock
      .expectOne(`${baseUrl}/seasons/2025/standings/drivers`)
      .flush(null, { status: 503, statusText: 'Service Unavailable' });

    expect(standings).toEqual([]);
  });

  it('requests the circuits only once and formats them for the components', () => {
    let first: { length: string; lap_record: string; circuitId: string }[] = [];
    service.getCircuits().subscribe((c) => (first = c));
    service.getCircuits().subscribe();

    httpMock.expectOne(`${baseUrl}/circuits`).flush([
      {
        id: 1,
        circuitRef: 'albert_park',
        name: 'Albert Park Circuit',
        grandPrixName: 'Australia Grand Prix',
        country: 'Australia',
        laps: 58,
        lengthKm: 5.278,
        lapRecordMs: 79813,
        imageUrl: 'img.png',
      },
    ]);

    expect(first[0]).toEqual(
      jasmine.objectContaining({
        length: '5.278 km',
        lap_record: '1:19.813',
        circuitId: 'albert_park',
      })
    );
  });

  it('formats lap records', () => {
    expect(formatLapRecord(79813)).toBe('1:19.813');
    expect(formatLapRecord(65005)).toBe('1:05.005');
  });
});
