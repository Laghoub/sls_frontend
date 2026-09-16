import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HrService } from '../../services/hr.service';
import { HrDashboard } from '../../models/hr.model';
import { SchoolYearService } from '../../../school/school-years/services/school-year.service';
import { SchoolYear } from '../../../school/school-years/models/school-year.model';
@Component({selector:'app-hr-dashboard',standalone:true,imports:[CommonModule,FormsModule,RouterLink],templateUrl:'./hr-dashboard.component.html',styleUrl:'./hr-dashboard.component.scss'})
export class HrDashboardComponent implements OnInit{
  private api=inject(HrService); private yearsApi=inject(SchoolYearService);
  data=signal<HrDashboard|null>(null); loading=signal(false); error=signal(''); years=signal<SchoolYear[]>([]); schoolYearId:number|null=null;
  ngOnInit(){this.yearsApi.getAll().subscribe(v=>{this.years.set(v);this.schoolYearId=v.find(x=>x.currentYear)?.id??null;this.load();},()=>this.load());}
  load(){this.loading.set(true);this.error.set('');this.api.dashboard(this.schoolYearId).subscribe({next:v=>{this.data.set(v);this.loading.set(false)},error:e=>{this.error.set(this.msg(e));this.loading.set(false)}})}
  rows(map:Record<string,number>|undefined){return Object.entries(map??{}).map(([label,value])=>({label,value})).sort((a,b)=>b.value-a.value)}
  max(rows:{label:string,value:number}[]){return Math.max(1,...rows.map(x=>x.value))}
  pct(value:number,max:number){return Math.max(2,Math.round(value*100/max))}
  private msg(e:any){return e?.error?.message||e?.error?.detail||'Impossible de charger le tableau de bord RH.'}
}
