import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MonthlyPointageService } from '../../services/monthly-pointage.service';
import { MonthlyPointageFilters, MonthlyPointageRow, MonthlyPointageSummary } from '../../models/monthly-pointage.model';
import { AuthService } from '../../../../core/config/auth/services/auth.service';

@Component({
 selector: 'app-monthly-pointage', standalone: true,
 imports: [CommonModule, FormsModule],
 templateUrl: './monthly-pointage.component.html',
 styleUrl: './monthly-pointage.component.scss'
})
export class MonthlyPointageComponent implements OnInit {
 private readonly api=inject(MonthlyPointageService);
 readonly auth=inject(AuthService);
 readonly loading=signal(false);
 readonly exporting=signal(false);
 readonly error=signal('');
 readonly rows=signal<MonthlyPointageSummary[]>([]);
 readonly details=signal<MonthlyPointageRow[]>([]);
 mode: 'global' | 'detail'='global';
 filters: MonthlyPointageFilters={from:'',to:'',cycle:''};
 get days():string[] {
  if(!this.filters.from || !this.filters.to) return [];
  const start=new Date(this.filters.from+'T12:00:00');
  const end=new Date(this.filters.to+'T12:00:00');
  if(end.getTime()-start.getTime()>366*86400000) return [];
  const result:string[]=[];
  for(let d=new Date(start);d<=end;d.setDate(d.getDate()+1)) {
   const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');
   result.push(`${y}-${m}-${day}`);
  }
  return result;
 }
 ngOnInit():void {
  const now=new Date(),y=now.getFullYear(),m=String(now.getMonth()+1).padStart(2,'0');
  this.filters.from=`${y}-${m}-01`;
  this.filters.to=`${y}-${m}-${String(new Date(y,now.getMonth()+1,0).getDate()).padStart(2,'0')}`;
  this.load();
 }
 load():void {
  if(!this.filters.from || !this.filters.to || this.filters.to<this.filters.from) {
   this.error.set('Vérifiez la période sélectionnée.');return;
  }
  this.loading.set(true);this.error.set('');
  if (this.mode === 'global') {
   this.api.summary(this.filters).subscribe({
    next: (data: MonthlyPointageSummary[]) => {
     this.rows.set(data);
     this.loading.set(false);
    },
    error: (e: unknown) => this.handleLoadError(e)
   });
  } else {
   this.api.details(this.filters).subscribe({
    next: (data: MonthlyPointageRow[]) => {
     this.details.set(data);
     this.loading.set(false);
    },
    error: (e: unknown) => this.handleLoadError(e)
   });
  }
 }
 private handleLoadError(error: unknown): void {
  const e = error as { error?: { message?: string } };
  this.error.set(e?.error?.message || 'Impossible de charger le pointage.');
  this.loading.set(false);
 }
 switchMode(mode:'global'|'detail'):void {this.mode=mode;this.load();}
 download(type:'pdf'|'csv'):void {
  this.exporting.set(true);this.error.set('');
  const obs=type==='pdf'?this.api.exportPdf(this.filters):this.api.exportCsv(this.filters);
  obs.subscribe({next:blob=>{
   const url=URL.createObjectURL(blob),a=document.createElement('a');
   a.href=url;a.download=`pointage-enseignants-${this.filters.from}-${this.filters.to}.${type}`;
   document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
   this.exporting.set(false);
  },error:e=>{this.error.set(e?.error?.message||'Export impossible.');this.exporting.set(false);}});
 }
 total():number {return this.rows().reduce((sum,r)=>sum+Number(r.totalHours||0),0);}
}
