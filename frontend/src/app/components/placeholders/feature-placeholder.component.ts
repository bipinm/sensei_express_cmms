import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-feature-placeholder',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <section class="feature-placeholder">
      <mat-icon color="primary" class="placeholder-icon">construction</mat-icon>
      <h2>{{ title }}</h2>
      <p>{{ description }}</p>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
        padding: 40px 24px;
      }

      .feature-placeholder {
        max-width: 520px;
        margin: 0 auto;
        text-align: center;
        color: #1f2937;
      }

      .placeholder-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 16px;
      }

      h2 {
        margin: 0 0 8px;
        font-size: 1.75rem;
        font-weight: 600;
      }

      p {
        margin: 0;
        color: #4b5563;
      }
    `,
  ],
})
export class FeaturePlaceholderComponent {
  constructor(private readonly route: ActivatedRoute) {}

  get title(): string {
    return this.route.snapshot.data['title'] ?? 'Coming soon';
  }

  get description(): string {
    return this.route.snapshot.data['description'] ?? 'This section is under construction.';
  }
}
