export interface RaceResultRow {
  position: string;
  driver: string;
  constructor: string;
  fastestLapTime: string;
  points: string;
  grid?: string;
}

export interface RaceResultsDialogEntry {
  raceName: string;
  results: RaceResultRow[];
}

export interface RaceResultsDialogData {
  season: number;
  round: string | null;
  race: string | null;
  raceData: RaceResultsDialogEntry[];
}
