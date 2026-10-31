import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../../core/api.config';
export interface CanteenDay { date:string; starter:string; mainCourse:string; sideDish:string; dessert:string; notes:string; }
export interface CanteenMenu { week_start?:string; weekStart?:string; status?:string; published:boolean; days:CanteenDay[]; }
export interface CanteenHistory { id:number; week_start:string; status:string; published_at?:string; updated_at?:string; }
@Injectable({providedIn:'root'})
export class CanteenService {
 private http=inject(HttpClient); private url=`${API_CONFIG.baseUrl}/canteen/menus`;
 history(){return this.http.get<CanteenHistory[]>(this.url);}
 detail(week:string){return this.http.get<CanteenMenu>(`${this.url}/${week}`);}
 current(){return this.http.get<CanteenMenu>(`${this.url}/current`);}
 save(menu:{weekStart:string;days:CanteenDay[]}){return this.http.put<CanteenMenu>(this.url,menu);}
 publish(week:string,published:boolean){return this.http.put<CanteenMenu>(`${this.url}/${week}/publication`,null,{params:{published:String(published)}});}
}
