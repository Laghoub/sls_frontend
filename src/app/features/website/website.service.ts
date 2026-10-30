import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { API_CONFIG } from '../../core/api.config';
export interface SiteContent {content_key:string;title_fr:string;title_ar:string;body_fr:string;body_ar:string;image_url?:string;published:boolean;}
export interface SiteNews {id:number;title_fr:string;title_ar:string;body_fr:string;body_ar:string;image_url?:string;published:boolean;published_at?:string;}
export interface SitePhoto {id:number;title_fr:string;title_ar:string;image_url:string;category:string;published:boolean;sort_order:number;}
@Injectable({providedIn:'root'}) export class WebsiteService {
 private http=inject(HttpClient); private root=API_CONFIG.baseUrl+'/website';
 publicContent(){return this.http.get<SiteContent[]>(this.root+'/public/content');}
 publicNews(){return this.http.get<SiteNews[]>(this.root+'/public/news');}
 publicGallery(){return this.http.get<SitePhoto[]>(this.root+'/public/gallery');}
 adminContent(){return this.http.get<SiteContent[]>(this.root+'/admin/content');}
 adminNews(){return this.http.get<SiteNews[]>(this.root+'/admin/news');}
 adminGallery(){return this.http.get<SitePhoto[]>(this.root+'/admin/gallery');}
 saveContent(x:SiteContent){return this.http.put<void>(this.root+'/admin/content/'+encodeURIComponent(x.content_key),x);}
 saveNews(x:SiteNews): Observable<void> {return x.id ? this.http.put<void>(this.root+'/admin/news/'+x.id,x) : this.http.post<{id:number}>(this.root+'/admin/news',x).pipe(map(() => void 0));}
 deleteNews(id:number){return this.http.delete<void>(this.root+'/admin/news/'+id);}
 savePhoto(x:SitePhoto): Observable<void> {return x.id ? this.http.put<void>(this.root+'/admin/gallery/'+x.id,x) : this.http.post<{id:number}>(this.root+'/admin/gallery',x).pipe(map(() => void 0));}
 deletePhoto(id:number){return this.http.delete<void>(this.root+'/admin/gallery/'+id);}
 upload(file:File){const fd=new FormData();fd.append('file',file);return this.http.post<{url:string}>(this.root+'/admin/media',fd);}
}
