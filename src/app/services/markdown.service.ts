import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';

@Injectable({
  providedIn: 'root'
})
export class MarkdownConverterService {
  constructor(private sanitizer: DomSanitizer) {}

  toHtml(markdown: string): SafeHtml {
    const html = marked.parse(markdown, {async:false})
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}