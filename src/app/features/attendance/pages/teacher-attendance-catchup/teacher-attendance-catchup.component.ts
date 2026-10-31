import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../../core/config/auth/services/auth.service';
import { HrService } from '../../../hr/services/hr.service';
import { Teacher, SubjectReference } from '../../../hr/models/hr.model';
import { ClassGroupService } from '../../../school/class-groups/services/class-group.service';
import { ClassGroup } from '../../../school/class-groups/models/class-group.model';
import { LevelService } from '../../../school/levels/services/level.service';
import { TimeSlotService } from '../../../school/time-slots/services/time-slot.service';
import { TimeSlot } from '../../../school/time-slots/models/time-slot.model';
import { CatchupLine, CatchupRecord, HistoricPattern, HistoricTemplate, TeacherAttendanceCatchupService } from '../../services/teacher-attendance-catchup.service';

@Component({selector:'app-teacher-attendance-catchup',standalone:true,
 imports:[CommonModule,FormsModule,RouterLink],
 templateUrl:'./teacher-attendance-catchup.component.html',
 styleUrl:'./teacher-attendance-catchup.component.scss'})
export class TeacherAttendanceCatchupComponent implements OnInit {
 readonly auth=inject(AuthService);
 private api=inject(TeacherAttendanceCatchupService);
 private hr=inject(HrService);
 private groups=inject(ClassGroupService);
 private levelsApi=inject(LevelService);
 private slotsApi=inject(TimeSlotService);
 teachers=signal<Teacher[]>([]); classes=signal<ClassGroup[]>([]);
 private allClasses:ClassGroup[]=[]; private allTeachers:Teacher[]=[];
 subjects=signal<SubjectReference[]>([]); slots=signal<TimeSlot[]>([]);
 entries=signal<CatchupRecord[]>([]); templates=signal<HistoricTemplate[]>([]);
 loading=signal(false); saving=signal(false); error=signal(''); success=signal('');
 tab:'manual'|'history'|'templates'='manual';
 from='2026-09-21'; to='2026-10-31'; teacherFilter:number|null=null;
 lines:CatchupLine[]=[];
 templateName=''; templateFrom='2026-09-21'; templateTo='2026-10-31';
 patterns:HistoricPattern[]=[]; selectedTemplateId:number|null=null;
 generateFrom='2026-09-21'; generateTo='2026-10-31'; excludeHolidays=true;
 get restrictedCycle():string|null {
  if(this.auth.hasRole('ADMIN')||this.auth.hasRole('SURVEILLANT_GENERAL'))return null;
  if(this.auth.hasRole('SURVEILLANT_LYCEE'))return 'LY';
  if(this.auth.hasRole('SURVEILLANT_COLLEGE'))return 'CO';
  if(this.auth.hasRole('SURVEILLANT_PRIMAIRE'))return 'PR';
  return null;
 }
 private cycleCode(label:string):string {
  const value=label.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  if(value==='LY'||value.includes('LYCEE')||value.includes('SECONDAIRE'))return 'LY';
  if(value==='CO'||value.includes('COLLEGE')||value.includes('MOYEN'))return 'CO';
  if(value==='PR'||value.includes('PRIMAIRE')||value.includes('PREPARATOIRE'))return 'PR';
  return value;
 }
 ngOnInit(){this.loading.set(true);forkJoin({teachers:this.hr.teachers(),classes:this.groups.getAll(),levels:this.levelsApi.getAll(),subjects:this.hr.subjects(),slots:this.slotsApi.getAll(),templates:this.api.templates()}).subscribe({
 next:r=>{
  this.allTeachers=r.teachers;this.allClasses=r.classes;
  const cycle=this.restrictedCycle;
  if(cycle){
   const levelIds=new Set(r.levels.filter(l=>this.cycleCode(l.cycleName||'')===cycle).map(l=>l.id));
   this.classes.set(r.classes.filter(c=>levelIds.has(c.levelId)));
   // Le rattrapage porte sur des dates historiques : ne pas filtrer les enseignants
   // à partir de leurs seules affectations actuelles. Le backend contrôle le cycle
   // de chaque classe lors de l'enregistrement et de la validation.
   this.teachers.set(r.teachers);
  }else{this.teachers.set(r.teachers);this.classes.set(r.classes);}
  this.subjects.set(r.subjects);this.slots.set(r.slots);this.templates.set(r.templates);this.addLine();this.addPattern();this.loading.set(false);
 },
 error:e=>{this.loading.set(false);this.error.set(this.message(e));}});}
 get canWrite(){return this.auth.hasPermission('ASSIDUITE_ENSEIGNANT_SAISIR');}
 get canValidate(){return this.auth.hasPermission('ASSIDUITE_ENSEIGNANT_VALIDER');}
 teacherName(id:number){const t=this.allTeachers.find(x=>x.id===id);return t?`${t.lastName} ${t.firstName}`:`#${id}`;}
 className(id:number){return this.allClasses.find(x=>x.id===id)?.name||`Classe n°${id}`;}
 subjectName(id:number){return this.subjects().find(x=>x.id===id)?.name||`Matière n°${id}`;}
 slotName(id:number){const s=this.slots().find(x=>x.id===id);return s?`${s.startTime}–${s.endTime}`:`#${id}`;}
 addLine(){this.lines.push({teacherId:0,classGroupId:0,subjectId:0,timeSlotId:0,date:this.from,status:'PRESENT',lateMinutes:0,reason:'',notes:''});}
 removeLine(i:number){this.lines.splice(i,1);}
 allPresent(){this.lines.forEach(l=>{l.status='PRESENT';l.lateMinutes=0;});}
 save(){this.error.set('');this.success.set('');if(!this.canWrite)return;
 if(!this.lines.length||this.lines.some(l=>!this.teachers().some(t=>t.id===l.teacherId)||!this.classes().some(c=>c.id===l.classGroupId)||!l.subjectId||!l.timeSlotId||!l.date||(l.status==='RETARD'&&l.lateMinutes<=0))){this.error.set('Complétez les champs obligatoires et les minutes de retard.');return;}
 this.saving.set(true);this.api.batch(this.lines).subscribe({next:r=>{this.saving.set(false);this.success.set(`${r.created} séance(s) enregistrée(s) en attente de validation.`);this.lines=[];this.addLine();},error:e=>{this.saving.set(false);this.error.set(this.message(e));}});}
 loadHistory(){this.error.set('');this.loading.set(true);this.api.list(this.from,this.to,this.teacherFilter).subscribe({next:r=>{this.entries.set(r);this.loading.set(false);},error:e=>{this.loading.set(false);this.error.set(this.message(e));}});}
 decide(row:CatchupRecord,decision:'validate'|'reject'){if(!this.canValidate)return;this.error.set('');this.api.decide(row.id,decision).subscribe({next:()=>this.loadHistory(),error:e=>this.error.set(this.message(e))});}
 addPattern(){this.patterns.push({teacherId:0,classGroupId:0,subjectId:0,timeSlotId:0,dayOfWeek:1});}
 saveTemplate(){this.error.set('');this.success.set('');if(!this.canWrite)return;
 if(!this.templateName.trim()||!this.patterns.length||this.patterns.some(p=>!this.teachers().some(t=>t.id===p.teacherId)||!this.classes().some(c=>c.id===p.classGroupId)||!p.subjectId||!p.timeSlotId)){this.error.set('Renseignez le nom et toutes les lignes du planning.');return;}
 this.saving.set(true);this.api.createTemplate(this.templateName.trim(),this.templateFrom,this.templateTo,this.patterns).subscribe({next:r=>{this.saving.set(false);this.success.set('Ancien emploi du temps enregistré.');this.selectedTemplateId=r.id;this.refreshTemplates();},error:e=>{this.saving.set(false);this.error.set(this.message(e));}});}
 refreshTemplates(){this.api.templates().subscribe({next:r=>this.templates.set(r),error:e=>this.error.set(this.message(e))});}
 generate(){this.error.set('');this.success.set('');if(!this.canWrite||!this.selectedTemplateId)return;
 if(!confirm('Générer les séances historiques en attente de validation ? Aucune séance ne sera validée automatiquement.'))return;
 this.saving.set(true);this.api.generate(this.selectedTemplateId,this.generateFrom,this.generateTo,this.excludeHolidays).subscribe({next:r=>{this.saving.set(false);this.success.set(`${r.created} séance(s) générée(s), ${r.skippedConflicts} conflit(s) ignoré(s).`);},error:e=>{this.saving.set(false);this.error.set(this.message(e));}});}
 private message(e:any){return e?.error?.detail||e?.error?.message||'Une erreur est survenue. Vérifiez vos droits et les données saisies.';}
}
