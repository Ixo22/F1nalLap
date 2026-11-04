/** Respuestas de la API propia (backend Spring Boot). */

export interface ApiDriver {
  driverRef: string;
  code: string | null;
  givenName: string;
  familyName: string;
  nationality: string | null;
  permanentNumber: number | null;
}

export interface ApiConstructor {
  constructorRef: string;
  name: string;
  nationality: string | null;
}

export interface ApiDriverStanding {
  position: number | null;
  positionText: string;
  points: number;
  wins: number;
  driver: ApiDriver;
  constructors: ApiConstructor[];
}

export interface ApiConstructorStanding {
  position: number | null;
  positionText: string;
  points: number;
  wins: number;
  constructor: ApiConstructor;
}

export interface ApiRace {
  season: number;
  round: number;
  name: string;
  date: string | null;
  circuitRef: string;
  circuitName: string | null;
}

export interface ApiResult {
  position: number;
  positionText: string;
  driver: ApiDriver;
  constructor: ApiConstructor;
  grid: number | null;
  points: number;
  status: string | null;
  laps: number | null;
  fastestLapTime: string | null;
}

export interface ApiRaceResults {
  round: number;
  name: string;
  date: string | null;
  circuitRef: string;
  results: ApiResult[];
}

export interface ApiRaceWinner {
  round: number;
  name: string;
  date: string | null;
  circuitRef: string;
  winner: ApiResult;
}

export interface ApiCircuit {
  id: number;
  circuitRef: string;
  name: string;
  grandPrixName: string;
  country: string;
  laps: number;
  lengthKm: number;
  lapRecordMs: number;
  imageUrl: string;
}

export type ApiCompound = 'SOFT' | 'MEDIUM' | 'HARD';

export interface ApiStint {
  compound: ApiCompound;
  laps: number;
}

export interface ApiStrategyResult {
  rank: number | null;
  stops: number;
  stints: ApiStint[];
  totalTimeSeconds: number;
  formattedTime: string;
}

export interface ApiDegradation {
  compound: ApiCompound;
  tyreLife: number;
  laps: { lap: number; phase: 'INITIAL' | 'MIDDLE' | 'END'; degradationSeconds: number }[];
}
