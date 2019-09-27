import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-layout-template',
  template: `
  <main role="main">
    <router-outlet></router-outlet>
  </main>
  `,
  styles: []
})
export class LayoutTemplateComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
