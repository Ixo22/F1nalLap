import { Component } from '@angular/core';

import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CloseOtherMenusDirective } from '../../Cerrado/cerrado.component';

@Component({
  selector: 'app-temp-actual',
  imports: [
    MatMenuModule,
    MatMenuTrigger,
    MatButtonModule,
  ],
  templateUrl: './temp-actual.component.html',
  styleUrl: './temp-actual.component.scss'
})
export class TempActualComponent extends CloseOtherMenusDirective{

}
