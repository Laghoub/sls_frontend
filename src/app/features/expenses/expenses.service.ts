import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
export interface Expense { id:number; expense_number:string; expense_date:string; expense_category_id:number; provider_id:number|null; category_name?:string; supplier_name?:string; description:string; amount:number; paid_amount:number; status:string; }
export interface Item { id:number; name:string; [key:string]:any }
@Injectable({providedIn:'root'}) export class ExpensesService {
 private http=inject(HttpClient); private root='/api/finance/expenses';
 list(filters:Record<string,string>={}):Observable<Expense[]>{let params=new HttpParams();Object.entries(filters).forEach(([k,v])=>{if(v)params=params.set(k,v)});return this.http.get<Expense[]>(this.root,{params})}
 categories(){return this.http.get<Item[]>(this.root+'/categories')}
 suppliers(){return this.http.get<Item[]>(this.root+'/suppliers')}
 create(data:any){return this.http.post<Expense>(this.root,data)}
 update(id:number,data:any){return this.http.put<Expense>(`${this.root}/${id}`,data)}
 action(id:number,action:'submit'|'approve'|'reject',body:any={}){return this.http.post<Expense>(`${this.root}/${id}/${action}`,body)}
 pay(id:number,data:any){return this.http.post<any>(`${this.root}/${id}/payments`,data)}
 payments(id:number){return this.http.get<any[]>(`${this.root}/${id}/payments`)}
 addCategory(data:any){return this.http.post<Item>(this.root+'/categories',data)}
 addSupplier(data:any){return this.http.post<Item>(this.root+'/suppliers',data)}
 updateSupplier(id:number,data:any){return this.http.put<Item>(`${this.root}/suppliers/${id}`,data)}
 budget(data:any){return this.http.post<any>(this.root+'/budgets',data)}
 report(type:'budget'|'categories'|'cashflow'|'salary-cashflow',params:any){return this.http.get<any[]>(`${this.root}/reports/${type}`,{params})}
 attachments(id:number){return this.http.get<any[]>(`${this.root}/${id}/attachments`)}
 addAttachment(id:number,data:any){return this.http.post<any>(`${this.root}/${id}/attachments`,data)}
}
