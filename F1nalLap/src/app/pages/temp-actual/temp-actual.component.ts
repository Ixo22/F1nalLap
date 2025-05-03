import { Component } from '@angular/core';
import { RouterModule }     from '@angular/router';
import { MatMenuModule }    from '@angular/material/menu';
import { MatButtonModule }  from '@angular/material/button';

import { CloseOtherMenusDirective } from '../../Cerrado/cerrado.component'

@Component({
  selector: 'app-temp-actual',
  standalone: true,
  imports: [
    RouterModule,
    MatMenuModule,
    MatButtonModule,
    CloseOtherMenusDirective  
  ],
  templateUrl: './temp-actual.component.html',
  styleUrls: ['./temp-actual.component.scss']
})
export class TempActualComponent {

}
