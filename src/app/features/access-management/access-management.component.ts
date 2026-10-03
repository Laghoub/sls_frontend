import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccessManagementService, Permission, Role } from './access-management.service';
import { AuthService } from '../../core/config/auth/services/auth.service';

@Component({selector:'app-access-management',standalone:true,imports:[CommonModule,FormsModule],templateUrl:'./access-management.component.html',styleUrl:'./access-management.component.scss'})
export class AccessManagementComponent implements OnInit {
 private api=inject(AccessManagementService);
 private auth=inject(AuthService);
 roles:Role[]=[]; permissions:Permission[]=[]; selected?:Role; selectedCodes=new Set<string>(); loading=true; saving=false; search='';
 modal=false; editing=false; form={code:'',name:'',description:'',active:true}; message=''; error='';
 ngOnInit(){ this.reload(); }
 reload(){ this.loading=true; this.error=''; this.api.permissions().subscribe({next:p=>{this.permissions=p.filter(x=>x.active);this.api.roles().subscribe({next:r=>{this.roles=r;this.loading=false;if(this.selected){const x=r.find(v=>v.id===this.selected!.id);if(x)this.select(x);}},error:()=>{this.loading=false;this.error='Impossible de charger les profils.';}})},error:()=>{this.loading=false;this.error='Impossible de charger les permissions.';}}); }
 select(r:Role){this.selected=r;this.selectedCodes=new Set(r.permissions||[]);this.message='';}
 modules(){return [...new Set(this.filteredPermissions().map(p=>p.module||'Autres'))].sort();}
 perms(module:string){return this.filteredPermissions().filter(p=>(p.module||'Autres')===module);}
 filteredPermissions(){const q=this.search.trim().toLowerCase();return !q?this.permissions:this.permissions.filter(p=>(p.name+' '+p.code+' '+p.module).toLowerCase().includes(q));}
 checked(code:string){return this.selectedCodes.has(code)}
 toggle(code:string){this.checked(code)?this.selectedCodes.delete(code):this.selectedCodes.add(code);}
 moduleAll(module:string){const ps=this.perms(module);return ps.length>0&&ps.every(p=>this.checked(p.code));}
 toggleModule(module:string){const ps=this.perms(module);const all=ps.every(p=>this.checked(p.code));ps.forEach(p=>all?this.selectedCodes.delete(p.code):this.selectedCodes.add(p.code));}
 savePermissions(){if(!this.selected)return;this.saving=true;this.api.setPermissions(this.selected.id,[...this.selectedCodes]).subscribe({next:r=>{this.selected=r;this.selectedCodes=new Set(r.permissions);this.roles=this.roles.map(x=>x.id===r.id?r:x);this.auth.loadCurrentUser().subscribe({next:()=>{this.saving=false;this.message='Droits enregistrés avec succès. Le menu a été actualisé.';},error:()=>{this.saving=false;this.message='Droits enregistrés. Reconnectez-vous pour actualiser votre menu.';}});},error:()=>{this.saving=false;this.error="Échec de l'enregistrement des droits.";}})}
 openCreate(){this.editing=false;this.form={code:'',name:'',description:'',active:true};this.modal=true;}
 openEdit(){if(!this.selected)return;this.editing=true;this.form={code:this.selected.code,name:this.selected.name,description:this.selected.description||'',active:this.selected.active};this.modal=true;}
 saveRole(){if(!this.form.code.trim()||!this.form.name.trim())return;this.saving=true;const req={...this.form,code:this.form.code.trim().toUpperCase().replace(/\s+/g,'_'),name:this.form.name.trim()};const obs=this.editing&&this.selected?this.api.updateRole(this.selected.id,req):this.api.createRole(req);obs.subscribe({next:r=>{this.saving=false;this.modal=false;this.reload();this.selected=r;this.message='Profil enregistré.';},error:()=>{this.saving=false;this.error="Impossible d'enregistrer le profil.";}})}
}
