import { CommonModule } from '@angular/common';
import { Component,OnInit,inject,signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HrService } from '../../services/hr.service';
import { SubjectReference,SubjectRequest } from '../../models/hr.model';
@Component({selector:'app-subjects',standalone:true,imports:[CommonModule,FormsModule],templateUrl:'./subjects.component.html',styleUrl:'./subjects.component.scss'})
export class SubjectsComponent implements OnInit{
 private api=inject(HrService);rows=signal<SubjectReference[]>([]);loading=signal(false);error=signal('');success=signal('');search='';showInactive=false;modal=false;saving=false;editing:SubjectReference|null=null;archiveTarget:SubjectReference|null=null;form:SubjectRequest={code:'',name:'',active:true,displayOrder:null};
 ngOnInit(){this.load()}
 load(){this.loading.set(true);this.api.subjects(true).subscribe({next:v=>{this.rows.set(v);this.loading.set(false)},error:e=>{this.loading.set(false);this.error.set(this.msg(e))}})}
 get filtered(){const q=this.search.trim().toLowerCase();return this.rows().filter(x=>(this.showInactive||x.active)&&(!q||`${x.code} ${x.name}`.toLowerCase().includes(q)))}
 openCreate(){this.editing=null;this.form={code:'',name:'',active:true,displayOrder:null};this.modal=true;this.error.set('')}
 openEdit(x:SubjectReference){this.editing=x;this.form={code:x.code,name:x.name,active:x.active,displayOrder:x.displayOrder??null};this.modal=true;this.error.set('')}
 close(){this.modal=false;this.editing=null}
 save(){if(!this.form.code.trim()||!this.form.name.trim()){this.error.set('Le code et le nom de la matière sont obligatoires.');return}this.saving=true;const wasEditing=!!this.editing;const obs=this.editing?this.api.updateSubject(this.editing.id,this.form):this.api.createSubject(this.form);obs.subscribe({next:()=>{this.saving=false;this.close();this.success.set(wasEditing?'Matière modifiée.':'Matière créée.');this.load()},error:e=>{this.saving=false;this.error.set(this.msg(e))}})}
 toggle(x:SubjectReference){this.api.setSubjectActive(x.id,!x.active).subscribe({next:()=>this.load(),error:e=>this.error.set(this.msg(e))})}
 askArchive(x:SubjectReference){this.archiveTarget=x}
 confirmArchive(){if(!this.archiveTarget)return;this.api.archiveSubject(this.archiveTarget.id).subscribe({next:()=>{this.archiveTarget=null;this.success.set('Matière archivée.');this.load()},error:e=>this.error.set(this.msg(e))})}
 private msg(e:any){return e?.error?.message||e?.error?.detail||'Une erreur est survenue.'}
}
