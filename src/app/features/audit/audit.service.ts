import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_CONFIG } from '../../core/api.config';
import { PageResponse } from '../../shared/models/page-response.model';

export interface AuditLog {
  id: number;
  occurredAt: string;
  userAccountId: number | null;
  username: string | null;
  userLastName: string | null;
  userFirstName: string | null;
  userRoles: string | null;
  module: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  description: string | null;
  oldValues: string | null;
  newValues: string | null;
  httpMethod: string | null;
  requestPath: string | null;
  httpStatus: number | null;
  ipAddress: string | null;
  requestId: string | null;
}

export interface AuditSearch {
  module?: string;
  action?: string;
  userId?: number | null;
  q?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}

@Injectable({ providedIn: 'root' })
export class AuditService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_CONFIG.baseUrl}/audit`;

  search(filters: AuditSearch) {
    let params = new HttpParams()
      .set('page', String(filters.page ?? 0))
      .set('size', String(filters.size ?? 50));
    if (filters.module) params = params.set('module', filters.module);
    if (filters.action) params = params.set('action', filters.action);
    if (filters.userId != null) params = params.set('userId', String(filters.userId));
    if (filters.q?.trim()) params = params.set('q', filters.q.trim());
    if (filters.from) params = params.set('from', filters.from);
    if (filters.to) params = params.set('to', filters.to);
    return this.http.get<PageResponse<AuditLog>>(this.url, { params });
  }
}
