import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';

import { CircuitsComponent } from './circuits.component';
import { EstrategiasService } from '../../services/strategies.service';
import { CircuitInfo } from '../../models/circuit.models';
import { EstrategiaResultado, MejorEstrategiaResultado } from '../../models/estrategia.models';
import circuitosJson from '../../../assets/json/circuitos2025.json';

describe('CircuitsComponent', () => {
  let strategiesSpy: jasmine.SpyObj<EstrategiasService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  const circuito: CircuitInfo = (circuitosJson as CircuitInfo[])[0];

  const estrategiaValida: EstrategiaResultado = {
    estrategia: 1,
    paradas: 1,
    stints: [
      { compuesto: 'medios', vueltas: 20 },
      { compuesto: 'duros', vueltas: circuito.laps - 20 },
    ],
    tiempo_total_segundos: 5000,
    tiempo_formateado: '83:20.000',
  };

  beforeEach(() => {
    strategiesSpy = jasmine.createSpyObj('EstrategiasService', [
      'getBestStrategies',
      'simularEstrategiaLibre',
      'getVidaUtil',
      'calcularDegradacionPorVuelta',
    ]);
    strategiesSpy.getVidaUtil.and.returnValue(30);
    strategiesSpy.calcularDegradacionPorVuelta.and.returnValue(0.2);
    strategiesSpy.getBestStrategies.and.returnValue(of([]));
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    TestBed.configureTestingModule({
      imports: [CircuitsComponent],
      providers: [provideRouter([]), { provide: EstrategiasService, useValue: strategiesSpy }],
    });
    // CircuitsComponent importa MatSnackBarModule directamente en su @Component,
    // lo que crea un injector propio para el componente: un `providers: [...]`
    // en el TestBed no basta para sustituir MatSnackBar ahí, hace falta
    // overrideProvider para que el override llegue a ese injector también.
    TestBed.overrideProvider(MatSnackBar, { useValue: snackBarSpy });
  });

  it('loads every circuit from the local JSON on init', () => {
    const fixture = TestBed.createComponent(CircuitsComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.circuits.length).toBe((circuitosJson as CircuitInfo[]).length);
    expect(fixture.componentInstance.filteredCircuits).toEqual(fixture.componentInstance.circuits);
  });

  it('filters circuits by name as the user types', () => {
    const fixture = TestBed.createComponent(CircuitsComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.circuitControl.setValue(circuito.name_GP);

    expect(component.filteredCircuits).toEqual([circuito]);
  });

  it('clears the selected circuit when the filter text is emptied', () => {
    const fixture = TestBed.createComponent(CircuitsComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.onCircuitSelected(circuito);
    expect(component.selectedCircuit).toBe(circuito);

    component.circuitControl.setValue('');
    expect(component.selectedCircuit).toBeNull();
  });

  it('populates bestStrategies when the service returns valid strategies', () => {
    strategiesSpy.getBestStrategies.and.returnValue(of([estrategiaValida]));

    const fixture = TestBed.createComponent(CircuitsComponent);
    fixture.detectChanges();
    fixture.componentInstance.showBestStrategies(circuito);

    expect(fixture.componentInstance.bestStrategies).toEqual([estrategiaValida]);
    expect(snackBarSpy.open).not.toHaveBeenCalled();
  });

  it('filters out the error case and warns via snackbar instead of crashing the template', () => {
    const soloError: MejorEstrategiaResultado[] = [
      { error: 'No se encontraron estrategias válidas para este circuito y configuración.' },
    ];
    strategiesSpy.getBestStrategies.and.returnValue(of(soloError));

    const fixture = TestBed.createComponent(CircuitsComponent);
    fixture.detectChanges();
    fixture.componentInstance.showBestStrategies(circuito);

    expect(fixture.componentInstance.bestStrategies).toEqual([]);
    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'No se encontraron estrategias válidas para este circuito.',
      'Cerrar',
      { duration: 5000 }
    );
  });

  it('warns and does not call the simulator when the stint laps do not add up to the circuit laps', () => {
    const fixture = TestBed.createComponent(CircuitsComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.selectedCircuit = circuito;
    component.simuladorStints = [{ compuesto: 'medios', vueltas: 10 }];

    component.simularEstrategiaLibre();

    expect(snackBarSpy.open).toHaveBeenCalled();
    expect(strategiesSpy.simularEstrategiaLibre).not.toHaveBeenCalled();
  });

  it('calls the simulator when the stint laps add up exactly to the circuit laps', () => {
    strategiesSpy.simularEstrategiaLibre.and.returnValue(of(estrategiaValida));

    const fixture = TestBed.createComponent(CircuitsComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.selectedCircuit = circuito;
    component.simuladorStints = [
      { compuesto: 'medios', vueltas: 20 },
      { compuesto: 'duros', vueltas: circuito.laps - 20 },
    ];

    component.simularEstrategiaLibre();

    expect(strategiesSpy.simularEstrategiaLibre).toHaveBeenCalledWith(circuito, [
      ['medios', 20],
      ['duros', circuito.laps - 20],
    ]);
    expect(component.simuladorResultado).toEqual(estrategiaValida);
    expect(snackBarSpy.open).not.toHaveBeenCalled();
  });

  describe('vueltasLibres', () => {
    it('returns the remaining laps not yet assigned to a stint', () => {
      const fixture = TestBed.createComponent(CircuitsComponent);
      fixture.detectChanges();
      const component = fixture.componentInstance;

      component.selectedCircuit = circuito;
      component.simuladorStints = [{ compuesto: 'medios', vueltas: 10 }];

      expect(component.vueltasLibres).toBe(circuito.laps - 10);
    });
  });
});
