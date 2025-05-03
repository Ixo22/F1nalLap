import { Component } from '@angular/core';
import { RouterModule }     from '@angular/router';
import { MatMenuModule }    from '@angular/material/menu';
import { MatButtonModule }  from '@angular/material/button';

import { CloseOtherMenusDirective } from '../../Cerrado/cerrado.component'

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterModule,
    MatMenuModule,
    MatButtonModule,
    CloseOtherMenusDirective  
  ],
  templateUrl: './last-temps.component.html',
  styleUrls: ['./last-temps.component.scss']
})
export class LastTempsComponent {

}
