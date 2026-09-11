import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../../../core/api.config';

import {
  Person,
  PersonCreateRequest
} from '../models/person.model';

@Injectable({
  providedIn: 'root'
})
export class PersonService {

  private readonly http = inject(HttpClient);

  private readonly url =
    `${API_CONFIG.baseUrl}/persons`;


  getAll(search?: string): Observable<Person[]> {

    let params = new HttpParams();

    if (search?.trim()) {
      params = params.set(
        'search',
        search.trim()
      );
    }

    return this.http.get<Person[]>(
      this.url,
      { params }
    );
  }


  getById(id: number): Observable<Person> {

    return this.http.get<Person>(
      `${this.url}/${id}`
    );
  }


  create(
    request: PersonCreateRequest
  ): Observable<Person> {

    return this.http.post<Person>(
      this.url,
      request
    );
  }
}