import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-markdown-viewer',
  standalone: true,
  imports: [CommonModule, MarkdownModule],
  templateUrl: './markdown-viewer.component.html',
  styleUrls: ['./markdown-viewer.component.scss']
})
export class MarkdownViewerComponent {
  @Input() label?: string;
  @Input() content?: string | null;
  @Input() emptyText = 'Nothing to show';

  get hasContent(): boolean {
    return !!this.content && this.content.trim().length > 0;
  }
}
