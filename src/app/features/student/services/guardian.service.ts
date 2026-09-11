import {
  inject,
  Injectable
} from '@angular/core';

import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';

import {
  API_CONFIG
} from '../../../core/api.config';

import {
  Guardian,
  GuardianCreateRequest,
  GuardianUpdateRequest,
  GuardianWithPersonCreateRequest,
  GuardianWithPersonResponse
} from '../models/guardian.model';
import { PageResponse } from '../../../shared/models/page-response.model';


@Injectable({
  providedIn: 'root'
})
export class GuardianService {

  private readonly http =
    inject(HttpClient);

  private readonly url =
    `${API_CONFIG.baseUrl}/guardians`;


  getAll(): Observable<Guardian[]> {

    return this.http.get<Guardian[]>(
      this.url
    );
  }


  getById(
    id: number
  ): Observable<Guardian> {

    return this.http.get<Guardian>(
      `${this.url}/${id}`
    );
  }


  create(
    request: GuardianCreateRequest
  ): Observable<Guardian> {

    return this.http.post<Guardian>(
      this.url,
      request
    );
  }


  createWithPerson(
    request:
      GuardianWithPersonCreateRequest
  ): Observable<GuardianWithPersonResponse> {

    return this.http
      .post<GuardianWithPersonResponse>(
        `${this.url}/with-person`,
        request
      );
  }


  update(
    id: number,
    request: GuardianUpdateRequest
  ): Observable<Guardian> {

    return this.http.put<Guardian>(
      `${this.url}/${id}`,
      request
    );
  }

  getPage(
  page = 0,
  size = 20,
  search = ''
): Observable<PageResponse<Guardian>> {

  let params =
    new HttpParams()
      .set(
        'page',
        page.toString()
      )
      .set(
        'size',
        size.toString()
      );


  if (search.trim()) {

    params =
      params.set(
        'search',
        search.trim()
      );
  }


  return this.http.get<
    PageResponse<Guardian>
  >(
    this.url,
    {
      params
    }
  );
}
}