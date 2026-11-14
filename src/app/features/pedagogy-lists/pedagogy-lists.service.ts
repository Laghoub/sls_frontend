import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_CONFIG } from '../../core/api.config';
export interface PedagogyListRow { [key: string]: unknown; matricule?: string; nom?: string; prenom?: string; classe?: string; cycle?: string; matiere?: string; date_naissance?: string; }
export interface ListFilters { schoolYearId?: number | null; cycleId?: number | null; classId?: number | null; subjectId?: number | null; }
@Injectable({providedIn:'root'})
export class PedagogyListsService {
  private http=inject(HttpClient);
  private base=`${API_CONFIG.baseUrl}/pedagogy/lists`;
  private params(filters:ListFilters) { let p=new HttpParams(); for(const [key,value] of Object.entries(filters)) if(value!==null && value!==undefined) p=p.set(key,String(value)); return p; }
  list(kind:'students'|'teachers', filters:ListFilters) {return this.http.get<PedagogyListRow[]>(`${this.base}/${kind}`,{params:this.params(filters)});}
  pdf(kind:'students'|'teachers', filters:ListFilters) {return this.http.get(`${this.base}/${kind}/pdf`,{params:this.params(filters),responseType:'blob'});}
}
