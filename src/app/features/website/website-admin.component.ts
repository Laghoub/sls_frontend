import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { WebsiteService,SiteContent,SiteNews,SitePhoto } from './website.service';
@Component({standalone:true,selector:'app-website-admin',imports:[CommonModule,FormsModule,RouterLink],templateUrl:'./website-admin.component.html',styleUrl:'./website-admin.component.scss'})
export class WebsiteAdminComponent implements OnInit {
 private api=inject(WebsiteService);tab:'content'|'news'|'gallery'='content';content:SiteContent[]=[];news:SiteNews[]=[];photos:SitePhoto[]=[];busy=false;message='';error='';
 ngOnInit(){this.refresh();}
 refresh(){this.api.adminContent().subscribe({next:v=>this.content=v,error:e=>this.fail(e)});this.api.adminNews().subscribe({next:v=>this.news=v,error:e=>this.fail(e)});this.api.adminGallery().subscribe({next:v=>this.photos=v,error:e=>this.fail(e)});}
 fail(e:any){this.error=e.status===413?'Image trop volumineuse. Essayez une image plus petite.':e.status===403?'Accès refusé : permission SITE_WEB_CONSULTER / SITE_WEB_MODIFIER requise.':'Erreur de communication avec le serveur.';this.busy=false;}
 done(){this.busy=false;this.message='Modifications enregistrées.';this.error='';this.refresh();}
 saveContent(x:SiteContent){this.busy=true;this.api.saveContent(x).subscribe({next:()=>this.done(),error:e=>this.fail(e)});}
 newNews(){this.news.unshift({id:0,title_fr:'',title_ar:'',body_fr:'',body_ar:'',published:false});this.tab='news';}
 saveNews(x:SiteNews){this.busy=true;this.api.saveNews(x).subscribe({next:()=>this.done(),error:e=>this.fail(e)});}
 removeNews(x:SiteNews){if(!x.id){this.news=this.news.filter(n=>n!==x);return;}if(confirm('Supprimer cette actualité ?'))this.api.deleteNews(x.id).subscribe({next:()=>this.done(),error:e=>this.fail(e)});}
 newPhoto(){this.photos.unshift({id:0,title_fr:'',title_ar:'',image_url:'',category:'general',published:false,sort_order:0});this.tab='gallery';}
 savePhoto(x:SitePhoto){this.busy=true;this.api.savePhoto(x).subscribe({next:()=>this.done(),error:e=>this.fail(e)});}
 removePhoto(x:SitePhoto){if(!x.id){this.photos=this.photos.filter(n=>n!==x);return;}if(confirm('Supprimer cette photo de la galerie ?'))this.api.deletePhoto(x.id).subscribe({next:()=>this.done(),error:e=>this.fail(e)});}
 async upload(event:Event,x:SiteContent|SiteNews|SitePhoto){
  const input=event.target as HTMLInputElement;const original=input.files?.[0];if(!original)return;
  this.busy=true;this.error='';this.message='Préparation de l’image…';
  try {
   const file=await this.prepareImage(original);
   this.api.upload(file).subscribe({next:r=>{x.image_url=r.url;this.busy=false;this.message='Image transférée. Cliquez sur Enregistrer pour publier sa référence.';input.value='';},error:e=>{this.fail(e);input.value='';}});
  } catch(e){this.busy=false;this.error=e instanceof Error?e.message:'Impossible de traiter cette image.';input.value='';}
 }
 private async prepareImage(file:File):Promise<File>{
  if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Formats acceptés : JPG, PNG, WebP.');
  const maxBytes=12*1024*1024;if(file.size>maxBytes)throw new Error('Image supérieure à 12 Mo : réduisez sa taille avant de l’importer.');
  if(file.size<1024*1024)return file;
  const img=await createImageBitmap(file);try{
   const scale=Math.min(1,1920/Math.max(img.width,img.height));
   const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));
   const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Compression indisponible.');ctx.drawImage(img,0,0,canvas.width,canvas.height);
   const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Compression impossible.')),'image/jpeg',0.82));
   return new File([blob],file.name.replace(/\.[^.]+$/,'')+'.jpg',{type:'image/jpeg'});
  }finally{img.close();}
 }
}
