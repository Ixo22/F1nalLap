import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import { F1ApiService } from './f1-api.service';
import {
  ConstructorStandingsResponse,
  DriverStandingsResponse,
  RaceTableResponse,
} from '../models/f1-api.models';

describe('F1ApiService', () => {
  let service: F1ApiService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.f1ApiBaseUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(F1ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getDriverStandings requests the driver standings endpoint for the season', () => {
    const mockResponse: DriverStandingsResponse = {
      MRData: {
        StandingsTable: {
          StandingsLists: [
            {
              DriverStandings: [
                {
                  position: '1',
                  points: '25',
                  wins: '1',
                  Driver: { givenName: 'Max', familyName: 'Verstappen' },
                  Constructors: [{ name: 'Red Bull' }],
                },
              ],
            },
          ],
        },
      },
    };

    service.getDriverStandings(2025).subscribe((result) => {
      expect(result).toEqual(mockResponse.MRData.StandingsTable.StandingsLists[0].DriverStandings);
    });

    const req = httpMock.expectOne(`${baseUrl}/2025/driverstandings.json`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('getDriverStandings resolves to an empty array on HTTP error instead of throwing', () => {
    service.getDriverStandings(2025).subscribe((result) => {
      expect(result).toEqual([]);
    });

    const req = httpMock.expectOne(`${baseUrl}/2025/driverstandings.json`);
    req.flush('server error', { status: 500, statusText: 'Internal Server Error' });
  });

  it('getConstructorStandings requests the constructor standings endpoint for the season', () => {
    const mockResponse: ConstructorStandingsResponse = {
      MRData: {
        StandingsTable: {
          StandingsLists: [
            {
              ConstructorStandings: [
                { position: '1', points: '400', wins: '10', Constructor: { name: 'Red Bull' } },
              ],
            },
          ],
        },
      },
    };

    service.getConstructorStandings(2025).subscribe((result) => {
      expect(result).toEqual(
        mockResponse.MRData.StandingsTable.StandingsLists[0].ConstructorStandings
      );
    });

    const req = httpMock.expectOne(`${baseUrl}/2025/constructorstandings.json`);
    req.flush(mockResponse);
  });

  it('getSeasonSchedule requests the season endpoint', () => {
    const mockResponse: RaceTableResponse = {
      MRData: {
        RaceTable: {
          Races: [
            {
              round: '1',
              raceName: 'Australia Grand Prix',
              date: '2025-03-16',
              Circuit: { circuitId: 'albert_park' },
            },
          ],
        },
      },
    };

    service.getSeasonSchedule(2025).subscribe((result) => {
      expect(result).toEqual(mockResponse.MRData.RaceTable.Races);
    });

    const req = httpMock.expectOne(`${baseUrl}/2025.json`);
    req.flush(mockResponse);
  });

  it('getRaceResults requests the results endpoint for the given round and unwraps the Results array', () => {
    const mockResponse: RaceTableResponse = {
      MRData: {
        RaceTable: {
          Races: [
            {
              round: '1',
              Circuit: { circuitId: 'albert_park' },
              Results: [
                {
                  position: '1',
                  Driver: { givenName: 'Max', familyName: 'Verstappen' },
                  Constructor: { name: 'Red Bull' },
                },
              ],
            },
          ],
        },
      },
    };

    service.getRaceResults(2025, 1).subscribe((result) => {
      expect(result).toEqual(mockResponse.MRData.RaceTable.Races[0].Results!);
    });

    const req = httpMock.expectOne(`${baseUrl}/2025/1/results.json`);
    req.flush(mockResponse);
  });

  it('getRaceResults resolves to an empty array when the race has no results yet', () => {
    const mockResponse: RaceTableResponse = {
      MRData: { RaceTable: { Races: [{ round: '1', Circuit: { circuitId: 'albert_park' } }] } },
    };

    service.getRaceResults(2025, 1).subscribe((result) => {
      expect(result).toEqual([]);
    });

    const req = httpMock.expectOne(`${baseUrl}/2025/1/results.json`);
    req.flush(mockResponse);
  });

  it('getSeasonWinners requests the position-1 results endpoint for the season', () => {
    const mockResponse: RaceTableResponse = {
      MRData: {
        RaceTable: {
          Races: [
            {
              round: '1',
              raceName: 'Australia Grand Prix',
              Circuit: { circuitId: 'albert_park' },
              Results: [
                {
                  position: '1',
                  Driver: { givenName: 'Max', familyName: 'Verstappen' },
                  Constructor: { name: 'Red Bull' },
                },
              ],
            },
          ],
        },
      },
    };

    service.getSeasonWinners(2025).subscribe((result) => {
      expect(result).toEqual(mockResponse.MRData.RaceTable.Races);
    });

    const req = httpMock.expectOne(`${baseUrl}/2025/results/1.json`);
    req.flush(mockResponse);
  });
});
