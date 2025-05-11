import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-dialog-season-results',
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatTableModule],
  templateUrl: './dialog-season-results.component.html',
  styleUrl: './dialog-season-results.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogSeasonResultsComponent {
   season: number;
   round: number;
   raceData: any[] = [];

   displayedColumns: string[] = ['position', 'driver', 'constructor', 'fastestLapTime', 'points'];


    constructor(
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.season = data.season;
    this.round = data.round;
    this.raceData = data.raceData;
    
    console.log('raceData:', this.raceData);
  }
}
