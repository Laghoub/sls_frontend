import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WebsiteService, SiteContent, SiteNews, SitePhoto } from './website.service';
@Component({standalone:true,selector:'app-public-website',imports:[CommonModule,RouterLink],templateUrl:'./public-website.component.html',styleUrl:'./public-website.component.scss'})
export class PublicWebsiteComponent implements OnInit {
 private api=inject(WebsiteService); lang:'fr'|'ar'=(localStorage.getItem('site-language')==='ar'?'ar':'fr');
 detail:(SiteContent|SiteNews)|null=null; selectedPhoto:SitePhoto|null=null; newsPage=1; galleryPage=1; readonly newsPageSize=6; readonly galleryPageSize=8; sections:SiteContent[]=[]; news:SiteNews[]=[];photos:SitePhoto[]=[]; error=false; menu=false;
 get newsPages(){return Math.max(1,Math.ceil(this.news.length/this.newsPageSize));}
 get galleryPages(){return Math.max(1,Math.ceil(this.photos.length/this.galleryPageSize));}
 get visibleNews(){return this.news.slice((this.newsPage-1)*this.newsPageSize,this.newsPage*this.newsPageSize);}
 get visiblePhotos(){return this.photos.slice((this.galleryPage-1)*this.galleryPageSize,this.galleryPage*this.galleryPageSize);}
 get newsPageNumbers(){return Array.from({length:this.newsPages},(_,i)=>i+1);}
 get galleryPageNumbers(){return Array.from({length:this.galleryPages},(_,i)=>i+1);}
 changeNewsPage(page:number){if(page<1||page>this.newsPages)return;this.newsPage=page;}
 changeGalleryPage(page:number){if(page<1||page>this.galleryPages)return;this.galleryPage=page;}
 openPhoto(photo:SitePhoto){this.selectedPhoto=photo;document.body.style.overflow='hidden';}
 closePhoto(){this.selectedPhoto=null;document.body.style.overflow='';}
 get rtl(){return this.lang==='ar';} setLang(l:'fr'|'ar'){this.lang=l;localStorage.setItem('site-language',l);document.documentElement.lang=l;}
 t(fr:string,ar:string){return this.rtl?ar:fr;} title(x:{title_fr:string;title_ar:string}){return this.t(x.title_fr,x.title_ar);} body(x:{body_fr:string;body_ar:string}){return this.t(x.body_fr,x.body_ar);}
 section(key:string){return this.sections.find(x=>x.content_key===key);}
 openDetails(x:SiteContent|SiteNews){this.detail=x;document.body.style.overflow="hidden";} closeDetails(){this.detail=null;document.body.style.overflow="";}
 ngOnInit(){document.documentElement.lang=this.lang;this.api.publicContent().subscribe({next:v=>this.sections=v,error:()=>this.error=true});this.api.publicNews().subscribe({next:v=>this.news=v,error:()=>this.error=true});this.api.publicGallery().subscribe({next:v=>this.photos=v,error:()=>this.error=true});}
}
