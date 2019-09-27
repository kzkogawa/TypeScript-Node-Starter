import { Component, OnInit } from '@angular/core';
import { ApiClient } from '../shared/api-client';

@Component({
  selector: 'app-home',
  template: `
    <p>
      home works!
    </p>
  `,
  styles: []
})
export class HomeComponent implements OnInit {

  constructor(private apiClient: ApiClient) { }

  ngOnInit() {
  }

}
