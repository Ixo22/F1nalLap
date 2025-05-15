import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-dialog-season-results',
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatTableModule],
  templateUrl: './dialog-2025-race-results.component.html',
  styleUrl: './dialog-2025-race-results.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dialog2025RaceResultsComponent {
   season: number;
   race: string;
   raceData: any[] = [];

   displayedColumns: string[] = ['position', 'driver', 'constructor', 'grid', 'fastestLapTime', 'points'];


    constructor(
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.season = data.season;
    this.raceData = data.raceData;
    this.race = data.race;
    
    console.log('raceData:', this.raceData);
  }

  getDriverImageUrl(driverName: string): string {
  const family = driverName.split(' ').pop();
  return family ? `https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/content/dam/fom-website/drivers/2025Drivers/${family}.jpg` : '';
  }


}
