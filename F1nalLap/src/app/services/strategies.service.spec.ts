import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { EstrategiasService } from './strategies.service';
import { CircuitInfo } from '../models/circuit.models';
import { esEstrategiaValida } from '../models/estrategia.models';

describe('EstrategiasService', () => {
  let service: EstrategiasService;

  const circuito: CircuitInfo = {
    id: 1,
    name: 'Suzuka Circuit',
    image: '',
    name_GP: 'Japan Grand Prix',
    country: 'Japan',
    laps: 53,
    length: '5.807 km',
    lap_record: '1:30.983',
    circuitId: 'suzuka',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EstrategiasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getVidaUtil', () => {
    it('returns the expected tyre life for each compound', () => {
      expect(service.getVidaUtil('blandos')).toBe(22);
      expect(service.getVidaUtil('medios')).toBe(33);
      expect(service.getVidaUtil('duros')).toBe(50);
    });
  });

  describe('calcularDegradacionPorVuelta', () => {
    it('stays within the "inicial" phase range for the first laps', () => {
      spyOn(Math, 'random').and.returnValue(0.5);
      const valor = service.calcularDegradacionPorVuelta('blandos', 0, 20);
      expect(valor).toBeGreaterThanOrEqual(0.2);
      expect(valor).toBeLessThanOrEqual(0.25);
    });

    it('stays within the "media" phase range once past lap 5 and before the tyre midlife', () => {
      spyOn(Math, 'random').and.returnValue(0.5);
      // vidaUtil.medios = 33 -> mitad = 16, así que la vuelta 10 cae en fase "media"
      const valor = service.calcularDegradacionPorVuelta('medios', 10, 20);
      expect(valor).toBeGreaterThanOrEqual(0.13);
      expect(valor).toBeLessThanOrEqual(0.17);
    });

    it('stays within the "final" phase range once past the tyre midlife', () => {
      spyOn(Math, 'random').and.returnValue(0.5);
      // vidaUtil.duros = 50 -> mitad = 25, así que la vuelta 30 cae en fase "final"
      const valor = service.calcularDegradacionPorVuelta('duros', 30, 35);
      expect(valor).toBeGreaterThanOrEqual(0.15);
      expect(valor).toBeLessThanOrEqual(0.8);
    });
  });

  describe('calcularMejoresEstrategias', () => {
    it('returns strategies whose stints add up to the total race laps', () => {
      const resultados = service.calcularMejoresEstrategias(circuito);
      expect(resultados.length).toBeGreaterThan(0);

      const validas = resultados.filter(esEstrategiaValida);
      expect(validas.length).toBeGreaterThan(0);

      for (const estrategia of validas) {
        const totalVueltas = estrategia.stints.reduce((acc, s) => acc + s.vueltas, 0);
        expect(totalVueltas).toBe(circuito.laps);
        expect(estrategia.paradas).toBe(estrategia.stints.length - 1);
      }
    });

    it('every returned strategy uses at least two different compounds', () => {
      const resultados = service.calcularMejoresEstrategias(circuito).filter(esEstrategiaValida);
      for (const estrategia of resultados) {
        const compuestosUsados = new Set(estrategia.stints.map((s) => s.compuesto));
        expect(compuestosUsados.size).toBeGreaterThanOrEqual(2);
      }
    });

    it('sorts strategies from best (lowest) to worst total time', () => {
      const resultados = service.calcularMejoresEstrategias(circuito).filter(esEstrategiaValida);
      for (let i = 1; i < resultados.length; i++) {
        expect(resultados[i].tiempo_total_segundos).toBeGreaterThanOrEqual(
          resultados[i - 1].tiempo_total_segundos
        );
      }
    });

    it('formats tiempo_formateado as m:ss.mmm', () => {
      const [primera] = service.calcularMejoresEstrategias(circuito).filter(esEstrategiaValida);
      expect(primera.tiempo_formateado).toMatch(/^\d+:\d{2}(:\d{2})?\.\d{3}$/);
    });
  });

  describe('simularEstrategiaLibre', () => {
    it('computes a two-stint strategy with one pit stop', async () => {
      const resultado = await firstValueFrom(
        service.simularEstrategiaLibre(circuito, [
          ['medios', 20],
          ['duros', 33],
        ])
      );

      expect(resultado.paradas).toBe(1);
      expect(resultado.stints).toEqual([
        { compuesto: 'medios', vueltas: 20 },
        { compuesto: 'duros', vueltas: 33 },
      ]);
      expect(resultado.tiempo_total_segundos).toBeGreaterThan(0);
      expect(resultado.tiempo_formateado).toMatch(/^\d+:\d{2}(:\d{2})?\.\d{3}$/);
    });

    it('applies a heavier degradation penalty once a stint outlives the tyre', async () => {
      spyOn(Math, 'random').and.returnValue(0);

      const dentroDeVida = await firstValueFrom(
        service.simularEstrategiaLibre(circuito, [
          ['blandos', 20],
          ['duros', 33],
        ])
      );
      const masAllaDeVida = await firstValueFrom(
        service.simularEstrategiaLibre(circuito, [
          ['blandos', 25],
          ['duros', 28],
        ])
      );

      // 25 vueltas > vidaUtil.blandos (22) debería penalizar el tiempo total
      // más que simplemente sumar 5 vueltas extra a ritmo normal.
      const tiempoExtraPorVuelta =
        (masAllaDeVida.tiempo_total_segundos - dentroDeVida.tiempo_total_segundos) / 5;
      // Con Math.random() fijado a 0, la degradación normal máxima es 0.8s/vuelta
      // (duros, fase final); un extra muy por encima de eso solo se explica por la
      // penalización de "0.5 + vueltasFueraDeVida^1.5 * 1.5" al superar vidaUtil.
      expect(tiempoExtraPorVuelta).toBeGreaterThan(1);
    });
  });

  describe('getBestStrategies', () => {
    it('wraps calcularMejoresEstrategias in an observable', async () => {
      const resultado = await firstValueFrom(service.getBestStrategies(circuito));
      expect(Array.isArray(resultado)).toBeTrue();
      expect(resultado.length).toBeGreaterThan(0);
    });
  });
});
