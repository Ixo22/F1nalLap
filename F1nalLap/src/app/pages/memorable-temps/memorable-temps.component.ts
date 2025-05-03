import { Component } from '@angular/core';

import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CloseOtherMenusDirective } from '../../Cerrado/cerrado.component';

@Component({
  selector: 'app-memorable-temps',
  imports: [
    MatMenuModule,
    MatMenuTrigger,
    MatButtonModule,
  ],
  templateUrl: './memorable-temps.component.html',
  styleUrl: './memorable-temps.component.scss'
})
export class MemorableTempsComponent extends CloseOtherMenusDirective{

}
