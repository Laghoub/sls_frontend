import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CanteenService,CanteenDay,CanteenHistory } from './canteen.service';
import { AuthService } from '../../core/config/auth/services/auth.service';
@Component({selector:'app-canteen-admin',standalone:true,imports: [CommonModule,FormsModule],templateUrl:'./canteen-admin.component.html',styleUrl:'./canteen.component.scss'})
export class CanteenAdminComponent implements OnInit {
 private api=inject(CanteenService); auth=inject(AuthService);
 weekStart=''; days:CanteenDay[]=[]; history:CanteenHistory[]=[]; published=false; exists=false;
 loading=false;saving=false;error='';success='';
 readonly labels=['Dimanche','Lundi','Mardi','Mercredi','Jeudi'];
 get canView(){return this.auth.hasRole('ADMIN')||this.auth.hasPermission('CANTINE_MENU_CONSULTER');}
 get canManage(){return this.auth.hasRole('ADMIN')||this.auth.hasPermission('CANTINE_MENU_GERER');}
 get canPublish(){return this.auth.hasRole('ADMIN')||this.auth.hasPermission('CANTINE_MENU_PUBLIER');}
 ngOnInit(){this.weekStart=this.sunday(new Date());this.resetDays();if(this.canView)this.loadHistory();this.loadWeek();}
 private localDate(d:Date):string {
  if(Number.isNaN(d.getTime())) throw new Error('Date de cantine invalide');
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
 }
 // Le backend renvoie des LocalDate SQL, parfois sérialisées en ISO UTC.
 // Les dates calendaires sans heure restent inchangées.
 private normalizeDate(value:string|null|undefined):string {
  if(!value || typeof value!=='string') throw new Error('Date de cantine manquante');
  if(/^\d{4}-\d{2}-\d{2}$/.test(value)) {
   const [y,m,d]=value.split('-').map(Number);
   const check=new Date(y,m-1,d);
   if(check.getFullYear()!==y||check.getMonth()!==m-1||check.getDate()!==d) throw new Error('Date de cantine invalide');
   return value;
  }
  const parsed=new Date(value);
  if(Number.isNaN(parsed.getTime())) throw new Error('Date de cantine invalide');
  const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Algiers',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(parsed);
  const part=(type:string)=>parts.find(p=>p.type===type)?.value??'';
  return `${part('year')}-${part('month')}-${part('day')}`;
 }
 private dateObject(value:string):Date {
  const [y,m,d]=this.normalizeDate(value).split('-').map(Number);
  return new Date(y,m-1,d);
 }
 private sunday(d:Date):string {
  const x=new Date(d.getFullYear(),d.getMonth(),d.getDate());
  x.setDate(x.getDate()-x.getDay());
  return this.localDate(x);
 }
 private dateAt(offset:number):string {
  const x=this.dateObject(this.weekStart);
  x.setDate(x.getDate()+offset);
  return this.localDate(x);
 }
 resetDays(){this.days=this.labels.map((_,i)=>({date:this.dateAt(i),starter:'',mainCourse:'',sideDish:'',dessert:'',notes:''}));}
 changeWeek(){if(!this.weekStart)return;try{this.weekStart=this.sunday(this.dateObject(this.weekStart));this.loadWeek();}catch{this.error='Date de semaine invalide.';}}
 shiftWeek(delta:number){try{const x=this.dateObject(this.weekStart);x.setDate(x.getDate()+7*delta);this.weekStart=this.sunday(x);this.loadWeek();}catch{this.error='Date de semaine invalide.';}}
 loadHistory(){this.api.history().subscribe({next:v=>this.history=(v||[]).filter(item=>{try{this.normalizeDate(item.week_start);return true;}catch{return false;}}),error:()=>this.error='Impossible de charger l’historique.'});}
 loadWeek(){
  this.error='';this.success='';this.loading=true;this.exists=false;this.published=false;this.resetDays();
  this.api.detail(this.weekStart).subscribe({
   next:m=>{
    this.exists=true;this.published=!!m.published;
    for(const day of m.days||[]){
     try{
      const normalized=this.normalizeDate(day.date);
      const idx=this.days.findIndex(d=>d.date===normalized);
      if(idx>=0)this.days[idx]={...this.days[idx],...day,date:normalized};
     }catch{/* Ignorer une date de jour invalide renvoyée par l'API */}
    }
    this.loading=false;
   },
   error:e=>{this.loading=false;if(e.status!==404)this.error='Impossible de charger le menu.';}
  });
 }
 save(){this.error='';this.success='';const days=this.days.filter(d=>d.mainCourse.trim()).map(d=>({...d}));if(!days.length){this.error='Renseignez au moins un plat principal.';return;}if(this.published){this.error='Dépubliez le menu avant de le modifier.';return;}this.saving=true;this.api.save({weekStart:this.weekStart,days}).subscribe({next:()=>{this.saving=false;this.exists=true;this.success='Menu enregistré en brouillon.';if(this.canView)this.loadHistory();},error:e=>{this.saving=false;this.error=e?.error?.message||'Enregistrement impossible.';}});}
 togglePublication(){this.error='';this.success='';this.saving=true;this.api.publish(this.weekStart,!this.published).subscribe({next:m=>{this.published=!!m.published;this.saving=false;this.success=this.published?'Menu publié.':'Menu dépublié.';if(this.canView)this.loadHistory();},error:e=>{this.saving=false;this.error=e?.error?.message||'Modification de publication impossible.';}});}
 openHistory(item:CanteenHistory){try{this.weekStart=this.sunday(this.dateObject(item.week_start));this.loadWeek();}catch{this.error='Date de l’historique invalide.';}}
}
