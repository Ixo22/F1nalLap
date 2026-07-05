import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { RaceResultsDialogData, RaceResultsDialogEntry } from '../../models/dialog.models';

@Component({
  selector: 'app-dialog-season-results',
  imports: [MatDialogModule, MatButtonModule, MatTableModule],
  templateUrl: './dialog-season-results.component.html',
  styleUrl: './dialog-season-results.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogSeasonResultsComponent {
  data = inject<RaceResultsDialogData>(MAT_DIALOG_DATA);

  season: number;
  race: string | null;
  raceData: RaceResultsDialogEntry[] = [];

  displayedColumns: string[] = ['position', 'driver', 'constructor', 'fastestLapTime', 'points'];

  constructor() {
    const data = this.data;

    this.season = data.season;
    this.raceData = data.raceData;
    this.race = data.race;
  }
}
