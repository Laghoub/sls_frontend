import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_CONFIG } from '../../core/api.config';

export interface Permission { id:number; code:string; name:string; module:string; description:string; active:boolean; }
export interface Role { id:number; code:string; name:string; description:string; systemRole:boolean; active:boolean; permissions:string[]; }
export interface RoleRequest { code:string; name:string; description:string; active:boolean; }

@Injectable({providedIn:'root'})
export class AccessManagementService {
  private http=inject(HttpClient); private url=`${API_CONFIG.baseUrl}/access-management`;
  permissions(){ return this.http.get<Permission[]>(`${this.url}/permissions`); }
  roles(){ return this.http.get<Role[]>(`${this.url}/roles`); }
  role(id:number){ return this.http.get<Role>(`${this.url}/roles/${id}`); }
  createRole(body:RoleRequest){ return this.http.post<Role>(`${this.url}/roles`,body); }
  updateRole(id:number,body:RoleRequest){ return this.http.put<Role>(`${this.url}/roles/${id}`,body); }
  setPermissions(id:number,codes:string[]){ return this.http.put<Role>(`${this.url}/roles/${id}/permissions`,{permissionCodes:codes}); }
}
