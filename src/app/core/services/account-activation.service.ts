import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../api.config';
export interface ActivateResponse { userAccountId:number; matricule:string; email:string; status:string; emailSent:boolean; }
export interface TokenStatus { valid:boolean; matricule:string; firstName:string; lastName:string; }
@Injectable({providedIn:'root'})
export class AccountActivationService {
 private http=inject(HttpClient); private base=`${API_CONFIG.baseUrl}/account-activation`;
 activate(personId:number,roleCode:string,matricule?:string|null){return this.http.post<ActivateResponse>(this.base,{personId,roleCode,matricule:matricule||null});}
 resend(personId:number,roleCode:string,matricule?:string|null){return this.http.post<ActivateResponse>(`${this.base}/resend`,{personId,roleCode,matricule:matricule||null});}
 status(token:string){return this.http.get<TokenStatus>(`${this.base}/public/status`,{params:{token}});}
 setPassword(token:string,password:string,confirmPassword:string){return this.http.post<void>(`${this.base}/public/password`,{token,password,confirmPassword});}
}
