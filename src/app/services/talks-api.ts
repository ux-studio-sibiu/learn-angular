import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Observable } from 'rxjs';

export type Talk = { id: number; title: string; speaker: string; summary: string };

// One typed place for API calls (≈ an api.ts module in React, a repository / HttpClient wrapper in .NET)
@Injectable({ providedIn: 'root' })
export class TalksApi {
  private readonly http = inject(HttpClient);

  // Returns an Observable, not a Promise: nothing is sent until someone subscribes.
  // The <Talk[]> generic is only a type cast, like `as Talk[]` after fetch: no runtime validation.
  getAll(): Observable<Talk[]> { return this.http.get<Talk[]>('/api/talks.json'); }
  getMissing(): Observable<Talk[]> { return this.http.get<Talk[]>('/api/missing.json'); }
}

// Resolver: the router subscribes and waits for this before showing the page (≈ loading data in an MVC action before View())
export const talksResolver: ResolveFn<Talk[]> = () => inject(TalksApi).getAll();
