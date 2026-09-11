import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/api.config';
import {
  AuthorizedPickupPerson,
  AuthorizedPickupPersonRequest,
} from '../models/authorized-pickup-person.model';
@Injectable({ providedIn: 'root' })
export class AuthorizedPickupPersonService {
  private http = inject(HttpClient);
  getByStudent(id: number): Observable<AuthorizedPickupPerson[]> {
    return this.http.get<AuthorizedPickupPerson[]>(
      `${API_CONFIG.baseUrl}/students/${id}/authorized-pickups`,
    );
  }
  create(id: number, r: AuthorizedPickupPersonRequest) {
    return this.http.post<AuthorizedPickupPerson>(
      `${API_CONFIG.baseUrl}/students/${id}/authorized-pickups`,
      r,
    );
  }
  update(studentId: number, id: number, r: AuthorizedPickupPersonRequest) {
    return this.http.put<AuthorizedPickupPerson>(
      `${API_CONFIG.baseUrl}/students/${studentId}/authorized-pickups/${id}`,
      r,
    );
  }
}
