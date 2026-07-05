import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { RaceResultsDialogData, RaceResultsDialogEntry } from '../../models/dialog.models';

@Component({
  selector: 'app-dialog-2025-race-results',
  imports: [MatDialogModule, MatButtonModule, MatTableModule],
  templateUrl: './dialog-2025-race-results.component.html',
  styleUrl: './dialog-2025-race-results.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dialog2025RaceResultsComponent {
  data = inject<RaceResultsDialogData>(MAT_DIALOG_DATA);

  season: number;
  race: string | null;
  raceData: RaceResultsDialogEntry[] = [];

  displayedColumns: string[] = [
    'position',
    'driver',
    'constructor',
    'grid',
    'fastestLapTime',
    'points',
  ];

  constructor() {
    const data = this.data;

    this.season = data.season;
    this.raceData = data.raceData;
    this.race = data.race;
  }

  getDriverImageUrl(driverName: string): string {
    const family = driverName.split(' ').pop();
    return family
      ? `https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/content/dam/fom-website/drivers/2025Drivers/${family}.jpg`
      : '';
  }
}
