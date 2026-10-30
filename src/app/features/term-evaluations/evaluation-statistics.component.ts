import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Campaign, TermEvaluationsService } from './term-evaluations.service';
type Row = Record<string,any>;
@Component({selector:'app-evaluation-statistics',standalone:true,imports:[CommonModule,FormsModule,RouterLink],templateUrl:'./evaluation-statistics.component.html',styleUrl:'./evaluation-statistics.component.scss'})
export class EvaluationStatisticsComponent implements OnInit {
 private api=inject(TermEvaluationsService);
 campaigns:Campaign[]=[]; campaignId=0; loading=false; error='';
 summary:Row={}; teachers:Row[]=[]; assignments:Row[]=[]; students:Row[]=[];
 teacherId=0;classGroupId=0;subjectId=0;levelId=0;status='';search='';view:'teachers'|'assignments'|'students'='teachers';
 readonly statuses=[['','Tous les statuts'],['PENDING','En attente'],['NOT_STARTED','Non commencées'],['DRAFT','Brouillons'],['RETURNED','Retournées'],['SUBMITTED','Soumises'],['APPROVED','Approuvées'],['COMPLETED','Terminées']];
 ngOnInit(){this.api.campaigns().subscribe({next:r=>{this.campaigns=r;this.campaignId=r[0]?.id||0;if(this.campaignId)this.loadOptions();},error:()=>this.error='Impossible de charger les campagnes'});}
 get params(){const p:Record<string,string>={};if(this.teacherId)p['teacherId']=String(this.teacherId);if(this.classGroupId)p['classGroupId']=String(this.classGroupId);if(this.subjectId)p['subjectId']=String(this.subjectId);if(this.levelId)p['levelId']=String(this.levelId);if(this.status)p['status']=this.status;return p;}
 get teacherOptions(){return this.unique(this.allTeachers,'teacher_id','teacher_name');}
 get classOptions(){return this.unique(this.allAssignments,'class_group_id','class_name');}
 get subjectOptions(){return this.unique(this.allAssignments,'subject_id','subject_name');}
 get levelOptions(){return this.unique(this.allAssignments,'level_id','level_id');}
 allTeachers:Row[]=[];allAssignments:Row[]=[];
 unique(rows:Row[],id:string,name:string){return [...new Map(rows.filter(r=>r[id]!=null).map(r=>[Number(r[id]),String(r[name]||r[id])])).entries()].sort((a,b)=>a[1].localeCompare(b[1]));}
 load(){if(!this.campaignId)return;this.loading=true;this.error='';const p=this.params;forkJoin({summary:this.api.stats(this.campaignId,'summary',p),teachers:this.api.stats(this.campaignId,'teachers',p),assignments:this.api.stats(this.campaignId,'assignments',p),students:this.api.stats(this.campaignId,'students',p)}).subscribe({next:r=>{this.summary=r.summary;this.teachers=r.teachers;this.assignments=r.assignments;this.students=r.students;this.loading=false;},error:e=>{this.loading=false;this.error=e?.error?.detail||e?.error?.message||'Chargement des statistiques impossible';}});}
 changeCampaign(){this.teacherId=0;this.classGroupId=0;this.subjectId=0;this.levelId=0;this.status='';this.loadOptions();}
 loadOptions(){if(!this.campaignId)return;forkJoin({teachers:this.api.stats(this.campaignId,'teachers'),assignments:this.api.stats(this.campaignId,'assignments')}).subscribe({next:r=>{this.allTeachers=r.teachers;this.allAssignments=r.assignments;this.load();},error:()=>this.load()});}
 selectTeacher(id:number){this.teacherId=id;this.view='assignments';this.load();}
 selectAssignment(r:Row){this.teacherId=Number(r['teacher_id']);this.classGroupId=Number(r['class_group_id']);this.subjectId=Number(r['subject_id']);this.view='students';this.load();}
 reset(){this.teacherId=0;this.classGroupId=0;this.subjectId=0;this.levelId=0;this.status='';this.search='';this.load();}
 get rows():Row[]{const source=this.view==='teachers'?this.teachers:this.view==='assignments'?this.assignments:this.students;const q=this.search.toLocaleLowerCase().trim();return q?source.filter(r=>Object.values(r).some(v=>String(v??'').toLocaleLowerCase().includes(q))):source;}
 label(status:string){return ({NOT_STARTED:'Non commencée',DRAFT:'Brouillon',RETURNED:'Retournée',SUBMITTED:'Soumise',APPROVED:'Approuvée'} as Record<string,string>)[status]||status;}
 num(r:Row,k:string){return Number(r[k]||0);}
 pct(r:Row){return Math.min(100,Math.max(0,Number(r['completion_percent']||0)));}
 exportCsv(){const rows=this.rows;if(!rows.length)return;const keys=Object.keys(rows[0]);const escape=(v:any)=>'"'+String(v??'').replace(/"/g,'""')+'"';const csv='\uFEFF'+[keys.map(escape).join(';'),...rows.map(r=>keys.map(k=>escape(r[k])).join(';'))].join('\r\n');const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`statistiques-evaluations-${this.campaignId}-${this.view}.csv`;a.click();URL.revokeObjectURL(a.href);}
}
