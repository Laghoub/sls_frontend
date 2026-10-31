import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../core/config/auth/services/auth.service';
import { ClassGroupService } from '../school/class-groups/services/class-group.service';
import { SchoolYearService } from '../school/school-years/services/school-year.service';
import { HrService } from '../hr/services/hr.service';
import { AssessmentPlanningService, AssessmentSchedule, AssessmentEntry } from './assessment-planning.service';
@Component({selector:'app-assessment-planning-admin',standalone:true,imports:[CommonModule,FormsModule],templateUrl:'./assessment-planning-admin.component.html',styleUrl:'./assessment-planning.component.scss'})
export class AssessmentPlanningAdminComponent implements OnInit {
 auth=inject(AuthService); api=inject(AssessmentPlanningService); classesApi=inject(ClassGroupService); yearsApi=inject(SchoolYearService); hr=inject(HrService);
 schedules:AssessmentSchedule[]=[]; classes:{id:number;name:string;schoolYearId:number}[]=[]; years:{id:number;label:string}[]=[]; subjects:{id:number;name:string}[]=[];
 selected:AssessmentSchedule|null=null; subjectsLoading=false; subjectsError=''; error=''; success=''; busy=false;
 form={schoolYearId:0,classGroupId:0,assessmentType:'DEVOIR',term:1,title:''};
 line={subjectId:0,assessmentDate:'',startTime:'08:30',endTime:'09:30',room:'',instructions:''}; editingEntryId:number|null=null;
 get canCreate(){return this.auth.hasRole('ADMIN')||this.auth.hasPermission('PLANNING_EVALUATION_CREER')}
 get canModify(){return this.auth.hasRole('ADMIN')||this.auth.hasPermission('PLANNING_EVALUATION_MODIFIER')}
 get canPublish(){return this.auth.hasRole('ADMIN')||this.auth.hasPermission('PLANNING_EVALUATION_PUBLIER')}
 get canDelete(){return this.auth.hasRole('ADMIN')||this.auth.hasPermission('PLANNING_EVALUATION_SUPPRIMER')}
 get filteredClasses(){return this.classes.filter(c=>!this.form.schoolYearId||c.schoolYearId===+this.form.schoolYearId)}
 ngOnInit(){forkJoin({classes:this.classesApi.getAll(),years:this.yearsApi.getAll()}).subscribe({next:r=>{this.classes=r.classes;this.years=r.years;this.form.schoolYearId=r.years[0]?.id||0;this.load()},error:()=>{this.error='Impossible de charger les référentiels.';this.load()}})}
 loadScheduleSubjects(id:number){
  this.subjectsLoading=true;this.subjectsError='';this.subjects=[];
  this.api.subjectsForSchedule(id).subscribe({
    next:subjects=>{if(this.selected?.id!==id)return;this.subjects=subjects;this.subjectsLoading=false;
      if(!subjects.length)this.subjectsError='Aucune matière configurée pour cette classe et cette année scolaire.';},
    error:()=>{if(this.selected?.id!==id)return;this.subjectsLoading=false;this.subjectsError='Impossible de charger les matières de cette classe.';}
  });
 }
 load(){this.api.list().subscribe({next:r=>this.schedules=r,error:()=>this.error='Impossible de charger les calendriers.'})}
 open(s:AssessmentSchedule){this.api.detail(s.id).subscribe({next:r=>{this.selected=r;this.error='';this.editingEntryId=null;this.line.subjectId=0;this.loadScheduleSubjects(r.id)},error:()=>this.error='Impossible de charger ce calendrier.'})}
 create(){if(!this.form.schoolYearId||!this.form.classGroupId||!this.form.title.trim()){this.error='Renseignez l’année, la classe et le titre.';return}this.busy=true;this.api.create({...this.form,schoolYearId:+this.form.schoolYearId,classGroupId:+this.form.classGroupId,term:+this.form.term}).subscribe({next:r=>{this.busy=false;this.success='Calendrier créé en brouillon.';this.load();this.open(r)},error:()=>{this.busy=false;this.error='Création impossible. Vérifiez les permissions et les données.'}})}
 saveEntry(){if(!this.selected||!this.line.subjectId||!this.line.assessmentDate){this.error='Choisissez une matière et une date.';return}const id=this.selected.id;const data={...this.line,subjectId:+this.line.subjectId};this.busy=true;const call=this.editingEntryId?this.api.editEntry(id,this.editingEntryId,data):this.api.addEntry(id,data);call.subscribe({next:()=>{this.busy=false;this.line={subjectId:0,assessmentDate:'',startTime:'08:30',endTime:'09:30',room:'',instructions:''};this.editingEntryId=null;this.open(this.selected!);this.success='Séance enregistrée.'},error:(err)=>{this.busy=false;this.error=err?.error?.detail||err?.error?.message||'Enregistrement refusé : vérifiez la date, la matière et les chevauchements.'}})}
 edit(e:AssessmentEntry){this.editingEntryId=e.id;this.line={subjectId:e.subject_id,assessmentDate:e.assessment_date,startTime:e.start_time.slice(0,5),endTime:e.end_time.slice(0,5),room:e.room||'',instructions:e.instructions||''}}
 removeEntry(e:AssessmentEntry){if(!this.selected||!confirm('Supprimer cette séance ?'))return;this.api.deleteEntry(this.selected.id,e.id).subscribe({next:()=>this.open(this.selected!),error:()=>this.error='Suppression impossible.'})}
 publish(){if(!this.selected||!confirm('Publier ce calendrier aux enseignants et aux parents ?'))return;this.api.publish(this.selected.id).subscribe({next:()=>{this.success='Calendrier publié.';this.open(this.selected!);this.load()},error:()=>this.error='Publication impossible.'})}
 archive(){if(!this.selected||!confirm('Archiver ce calendrier ?'))return;this.api.archive(this.selected.id).subscribe({next:()=>{this.open(this.selected!);this.load()},error:()=>this.error='Archivage impossible.'})}
 deleteSchedule(){if(!this.selected||!confirm('Supprimer définitivement ce brouillon ?'))return;this.api.remove(this.selected.id).subscribe({next:()=>{this.selected=null;this.load()},error:()=>this.error='Suppression impossible.'})}
 print(s:AssessmentSchedule){this.api.print(s.id).subscribe({next:blob=>{const url=URL.createObjectURL(blob);window.open(url,'_blank');setTimeout(()=>URL.revokeObjectURL(url),60000)},error:()=>this.error='Impossible de générer le PDF.'})}
}
