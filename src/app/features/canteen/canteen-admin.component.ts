import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CanteenService,CanteenDay,CanteenHistory } from './canteen.service';
import { AuthService } from '../../core/config/auth/services/auth.service';
@Component({selector:'app-canteen-admin',standalone:true,imports:[CommonModule,FormsModule],templateUrl:'./canteen-admin.component.html',styleUrl:'./canteen.component.scss'})
export class CanteenAdminComponent implements OnInit {
 private api=inject(CanteenService); auth=inject(AuthService);
 weekStart=''; days:CanteenDay[]=[]; history:CanteenHistory[]=[]; published=false; exists=false;
 loading=false;saving=false;error='';success='';
 readonly labels=['Dimanche','Lundi','Mardi','Mercredi','Jeudi'];
 get canView(){return this.auth.hasRole('ADMIN')||this.auth.hasPermission('CANTINE_MENU_CONSULTER');}
 get canManage(){return this.auth.hasRole('ADMIN')||this.auth.hasPermission('CANTINE_MENU_GERER');}
 get canPublish(){return this.auth.hasRole('ADMIN')||this.auth.hasPermission('CANTINE_MENU_PUBLIER');}
 ngOnInit(){this.weekStart=this.sunday(new Date());this.resetDays();if(this.canView)this.loadHistory();this.loadWeek();}
 private localDate(d:Date){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
 private sunday(d:Date){const x=new Date(d.getFullYear(),d.getMonth(),d.getDate());x.setDate(x.getDate()-x.getDay());return this.localDate(x);}
 private dateAt(offset:number){const [y,m,d]=this.weekStart.split('-').map(Number);const x=new Date(y,m-1,d+offset);return this.localDate(x);}
 resetDays(){this.days=this.labels.map((_,i)=>({date:this.dateAt(i),starter:'',mainCourse:'',sideDish:'',dessert:'',notes:''}));}
 changeWeek(){if(!this.weekStart)return;const [y,m,d]=this.weekStart.split('-').map(Number);this.weekStart=this.sunday(new Date(y,m-1,d));this.loadWeek();}
 shiftWeek(delta:number){const [y,m,d]=this.weekStart.split('-').map(Number);this.weekStart=this.localDate(new Date(y,m-1,d+7*delta));this.loadWeek();}
 loadHistory(){this.api.history().subscribe({next:v=>this.history=v||[],error:()=>this.error='Impossible de charger l’historique.'});}
 loadWeek(){this.error='';this.success='';this.loading=true;this.exists=false;this.published=false;this.resetDays();this.api.detail(this.weekStart).subscribe({next:m=>{this.exists=true;this.published=!!m.published;for(const day of m.days||[]){const idx=this.days.findIndex(d=>d.date===day.date);if(idx>=0)this.days[idx]={...this.days[idx],...day};}this.loading=false;},error:e=>{this.loading=false;if(e.status!==404)this.error='Impossible de charger le menu.';}});}
 save(){this.error='';this.success='';const days=this.days.filter(d=>d.mainCourse.trim()).map(d=>({...d}));if(!days.length){this.error='Renseignez au moins un plat principal.';return;}if(this.published){this.error='Dépubliez le menu avant de le modifier.';return;}this.saving=true;this.api.save({weekStart:this.weekStart,days}).subscribe({next:()=>{this.saving=false;this.exists=true;this.success='Menu enregistré en brouillon.';if(this.canView)this.loadHistory();},error:e=>{this.saving=false;this.error=e?.error?.message||'Enregistrement impossible.';}});}
 togglePublication(){this.error='';this.success='';this.saving=true;this.api.publish(this.weekStart,!this.published).subscribe({next:m=>{this.published=!!m.published;this.saving=false;this.success=this.published?'Menu publié.':'Menu dépublié.';if(this.canView)this.loadHistory();},error:e=>{this.saving=false;this.error=e?.error?.message||'Modification de publication impossible.';}});}
 openHistory(item:CanteenHistory){this.weekStart=item.week_start;this.loadWeek();}
}
