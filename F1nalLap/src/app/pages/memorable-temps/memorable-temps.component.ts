import { Component } from '@angular/core';
import { RouterModule }     from '@angular/router';
import { MatMenuModule }    from '@angular/material/menu';
import { MatButtonModule }  from '@angular/material/button';

import { CloseOtherMenusDirective } from '../../Cerrado/cerrado.component'


@Component({
  selector: 'app-memorable-temps',
  imports: [
    RouterModule,
    MatMenuModule,
    MatButtonModule,
    CloseOtherMenusDirective  
  ],
  templateUrl: './memorable-temps.component.html',
  styleUrls: ['./memorable-temps.component.scss']
})
export class MemorableTempsComponent{

}
