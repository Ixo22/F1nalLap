import { Component } from '@angular/core';

import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CloseOtherMenusDirective } from '../../Cerrado/cerrado.component';

@Component({
  selector: 'app-last-temps',
  imports: [
    MatMenuModule,
    MatMenuTrigger,
    MatButtonModule,
  ],
  templateUrl: './last-temps.component.html',
  styleUrl: './last-temps.component.scss'
})
export class LastTempsComponent extends CloseOtherMenusDirective {

}
