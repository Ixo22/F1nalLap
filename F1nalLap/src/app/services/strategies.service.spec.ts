import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import { EstrategiasService } from './strategies.service';
import { CircuitInfo } from '../models/circuit.models';
import { MejorEstrategiaResultado } from '../models/estrategia.models';

describe('EstrategiasService', () => {
  let service: EstrategiasService;
  let httpMock: HttpTestingController;
  const url = `${environment.apiBaseUrl}/circuits/albert_park`;

  const circuito: CircuitInfo = {
    id: 1,
    name: 'Albert Park Circuit',
    image: '',
    name_GP: 'Australia Grand Prix',
    country: 'Australia',
    laps: 58,
    length: '5.278 km',
    lap_record: '1:19.813',
    circuitId: 'albert_park',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(EstrategiasService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('maps the best strategies to the Spanish model', () => {
    let result: MejorEstrategiaResultado[] = [];
    service.getBestStrategies(circuito).subscribe((r) => (result = r));

    httpMock.expectOne(`${url}/strategies/best`).flush([
      {
        rank: 1,
        stops: 1,
        stints: [
          { compound: 'MEDIUM', laps: 25 },
          { compound: 'HARD', laps: 33 },
        ],
        totalTimeSeconds: 4734.5,
        formattedTime: '1:18:54.500',
      },
    ]);

    expect(result).toEqual([
      {
        estrategia: 1,
        paradas: 1,
        stints: [
          { compuesto: 'medios', vueltas: 25 },
          { compuesto: 'duros', vueltas: 33 },
        ],
        tiempo_total_segundos: 4734.5,
        tiempo_formateado: '1:18:54.500',
      },
    ]);
  });

  it('returns an error entry when there are no strategies or the API fails', () => {
    let empty: MejorEstrategiaResultado[] = [];
    let failed: MejorEstrategiaResultado[] = [];
    service.getBestStrategies(circuito).subscribe((r) => (empty = r));
    httpMock.expectOne(`${url}/strategies/best`).flush([]);
    service.getBestStrategies(circuito).subscribe((r) => (failed = r));
    httpMock.expectOne(`${url}/strategies/best`).flush(null, { status: 500, statusText: 'Error' });

    expect('error' in empty[0]).toBeTrue();
    expect('error' in failed[0]).toBeTrue();
  });

  it('sends a free strategy with English compound names', () => {
    let paradas: number | undefined;
    service
      .simularEstrategiaLibre(circuito, [
        ['blandos', 20],
        ['duros', 38],
      ])
      .subscribe((r) => (paradas = r.paradas));

    const req = httpMock.expectOne(`${url}/strategies/simulate`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      stints: [
        { compound: 'SOFT', laps: 20 },
        { compound: 'HARD', laps: 38 },
      ],
    });
    req.flush({
      rank: null,
      stops: 1,
      stints: req.request.body.stints,
      totalTimeSeconds: 4800,
      formattedTime: '1:20:00.000',
    });

    expect(paradas).toBe(1);
  });

  it('maps lap-by-lap degradation and its phases', () => {
    let puntos: { vuelta: number; fase: string; value: number }[] = [];
    service.getDegradacionStint(circuito, 'medios', 2).subscribe((p) => (puntos = p));

    const req = httpMock.expectOne((r) => r.url === `${url}/degradation`);
    expect(req.request.params.get('compound')).toBe('MEDIUM');
    expect(req.request.params.get('laps')).toBe('2');
    req.flush({
      compound: 'MEDIUM',
      tyreLife: 33,
      laps: [
        { lap: 1, phase: 'INITIAL', degradationSeconds: 0.17 },
        { lap: 2, phase: 'END', degradationSeconds: 0.2 },
      ],
    });

    expect(puntos).toEqual([
      { vuelta: 1, fase: 'inicial', value: 0.17 },
      { vuelta: 2, fase: 'final', value: 0.2 },
    ]);
  });
});
