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
  templateUrl: './home.component.html',
  styleUrls:   ['./home.component.scss']  
})

export class HomeComponent {

}
