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
  Student,
  StudentCreateRequest,
  StudentUpdateRequest,
  StudentWithPersonCreateRequest,
  StudentWithPersonResponse
} from '../models/student.model';
import { PageResponse } from '../../../shared/models/page-response.model';


@Injectable({
  providedIn: 'root'
})
export class StudentService {

  private readonly http =
    inject(HttpClient);

  private readonly url =
    `${API_CONFIG.baseUrl}/students`;


  getAll(): Observable<Student[]> {

    return this.http.get<Student[]>(
      this.url
    );
  }


  getById(
    id: number
  ): Observable<Student> {

    return this.http.get<Student>(
      `${this.url}/${id}`
    );
  }


  /*
   * Ancienne création.
   *
   * On la conserve, mais notre interface
   * principale ne l'utilise plus.
   */
  create(
    request: StudentCreateRequest
  ): Observable<Student> {

    return this.http.post<Student>(
      this.url,
      request
    );
  }


  /*
   * Nouvelle création correcte.
   *
   * Person + Student dans une seule
   * transaction backend.
   */
  createWithPerson(
    request: StudentWithPersonCreateRequest
  ): Observable<StudentWithPersonResponse> {

    return this.http.post<StudentWithPersonResponse>(
      `${this.url}/with-person`,
      request
    );
  }


  update(
    id: number,
    request: StudentUpdateRequest
  ): Observable<Student> {

    return this.http.put<Student>(
      `${this.url}/${id}`,
      request
    );
  }


  getPage(
  page = 0,
  size = 20,
  search = ''
): Observable<PageResponse<Student>> {

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
    PageResponse<Student>
  >(
    this.url,
    {
      params
    }
  );
}
}