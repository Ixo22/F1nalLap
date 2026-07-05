export interface DriverStanding {
  position: string;
  points: string;
  wins: string;
  Driver: { givenName: string; familyName: string };
  Constructors: { name: string }[];
}

export interface ConstructorStanding {
  position: string;
  points: string;
  wins: string;
  Constructor: { name: string };
}

export interface RaceResult {
  position: string;
  grid?: string;
  points?: string;
  Driver: { givenName: string; familyName: string };
  Constructor: { name: string };
  FastestLap?: { Time?: { time: string } };
}

export interface RaceScheduleEntry {
  round: string;
  raceName?: string;
  date?: string;
  Circuit: { circuitId: string };
  Results?: RaceResult[];
}

export interface DriverStandingsResponse {
  MRData: {
    StandingsTable: { StandingsLists: { DriverStandings: DriverStanding[] }[] };
  };
}

export interface ConstructorStandingsResponse {
  MRData: {
    StandingsTable: {
      StandingsLists: { ConstructorStandings: ConstructorStanding[] }[];
    };
  };
}

export interface RaceTableResponse {
  MRData: { RaceTable: { Races: RaceScheduleEntry[] } };
}
