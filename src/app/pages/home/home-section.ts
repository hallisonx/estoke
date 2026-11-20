import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-home-section',
  styleUrl: './home-section.css',
  templateUrl: './home-section.html',
})
export class HomeSection {
  private readonly route = inject(ActivatedRoute);
  readonly title = this.route.snapshot.data['title'] as string;
  readonly description = this.route.snapshot.data['description'] as
    | string
    | undefined;
}
