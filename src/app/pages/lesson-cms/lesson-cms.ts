import { JsonPipe } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { BlockRenderer } from '../../cms/block-renderer';
import { CmsPage } from '../../cms/blocks';

@Component({
  selector: 'app-lesson-cms',
  imports: [BlockRenderer, RouterLink, JsonPipe],
  templateUrl: './lesson-cms.html',
  styleUrl: './lesson-cms.scss'
})
export class LessonCms {
  protected readonly documents = [
    { slug: 'davos-2027', label: 'Davos 2027' },
    { slug: 'future-of-jobs', label: 'Future of jobs' }
  ];

  // ?page=… arrives as an input (lesson 06). The URL is the state, so every page is linkable and server-renderable.
  readonly page = input<string>();
  protected readonly slug = computed(() => this.page() ?? this.documents[0].slug);

  // ≈ fetching the document with GROQ / the Sanity client. Rendered on the server, reused in the browser via the
  // transfer cache (lesson 12). Changing ?page= re-fetches automatically (lesson 07).
  protected readonly doc = httpResource<CmsPage>(() => `/api/pages/${this.slug()}.json`);

  protected readonly outlines = signal(false);

  constructor() {
    // SEO from CMS fields (≈ generateMetadata). Title and Meta work on the server too, so the HTML is right for crawlers.
    const title = inject(Title), meta = inject(Meta);
    effect(() => {
      if (!this.doc.hasValue()) return;
      const page = this.doc.value();
      title.setTitle(`${page.title} · 17 CMS blocks`);
      meta.updateTag({ name: 'description', content: page.description });
    });
  }
}
