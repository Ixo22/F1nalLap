import { Component } from '@angular/core';

import { RouterModule } from '@angular/router';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

import { CloseOtherMenusDirective } from '../../Cerrado/cerrado.component'

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule,
    MatMenuModule,
    MatMenuTrigger,
    MatButtonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent extends CloseOtherMenusDirective {

}
