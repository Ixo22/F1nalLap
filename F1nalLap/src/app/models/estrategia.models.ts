export type Compuesto = 'blandos' | 'medios' | 'duros';

export interface StintResultado {
  compuesto: Compuesto;
  vueltas: number;
}

export interface EstrategiaResultado {
  estrategia?: number;
  paradas: number;
  stints: StintResultado[];
  tiempo_total_segundos: number;
  tiempo_formateado: string;
}

export interface EstrategiaError {
  error: string;
}

export type MejorEstrategiaResultado = EstrategiaResultado | EstrategiaError;

export function esEstrategiaValida(
  resultado: MejorEstrategiaResultado
): resultado is EstrategiaResultado {
  return !('error' in resultado);
}
