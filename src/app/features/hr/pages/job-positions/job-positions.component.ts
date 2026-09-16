import { CommonModule } from '@angular/common';
import { Component,OnInit,inject,signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HrService } from '../../services/hr.service';
import { JobPosition,JobPositionRequest } from '../../models/hr.model';
@Component({selector:'app-job-positions',standalone:true,imports:[CommonModule,FormsModule],templateUrl:'./job-positions.component.html',styleUrl:'./job-positions.component.scss'})
export class JobPositionsComponent implements OnInit{
 private api=inject(HrService);rows=signal<JobPosition[]>([]);loading=signal(false);error=signal('');success=signal('');search='';category='';showInactive=false;modal=false;saving=false;editing:JobPosition|null=null;archiveTarget:JobPosition|null=null;form:JobPositionRequest={code:'',name:'',category:null,active:true,displayOrder:null};
 ngOnInit(){this.load()}
 load(){this.loading.set(true);this.api.jobPositions(true).subscribe({next:v=>{this.rows.set(v);this.loading.set(false)},error:e=>{this.loading.set(false);this.error.set(this.msg(e))}})}
 get categories(){return [...new Set(this.rows().map(x=>x.category).filter((x):x is string=>!!x))].sort()}
 get filtered(){const q=this.search.trim().toLowerCase();return this.rows().filter(x=>(this.showInactive||x.active)&&(!this.category||x.category===this.category)&&(!q||`${x.code} ${x.name} ${x.category||''}`.toLowerCase().includes(q)))}
 openCreate(){this.editing=null;this.form={code:'',name:'',category:null,active:true,displayOrder:null};this.modal=true;this.error.set('')}
 openEdit(x:JobPosition){this.editing=x;this.form={code:x.code,name:x.name,category:x.category,active:x.active,displayOrder:x.displayOrder};this.modal=true;this.error.set('')}
 close(){this.modal=false;this.editing=null}
 save(){if(!this.form.code.trim()||!this.form.name.trim()){this.error.set('Le code et l’intitulé du poste sont obligatoires.');return}this.saving=true;const wasEditing=!!this.editing;const obs=this.editing?this.api.updateJobPosition(this.editing.id,this.form):this.api.createJobPosition(this.form);obs.subscribe({next:()=>{this.saving=false;this.close();this.success.set(wasEditing?'Poste modifié.':'Poste créé.');this.load()},error:e=>{this.saving=false;this.error.set(this.msg(e))}})}
 toggle(x:JobPosition){this.api.setJobPositionActive(x.id,!x.active).subscribe({next:()=>this.load(),error:e=>this.error.set(this.msg(e))})}
 askArchive(x:JobPosition){this.archiveTarget=x}
 confirmArchive(){if(!this.archiveTarget)return;this.api.archiveJobPosition(this.archiveTarget.id).subscribe({next:()=>{this.archiveTarget=null;this.success.set('Poste archivé.');this.load()},error:e=>this.error.set(this.msg(e))})}
 private msg(e:any){return e?.error?.message||e?.error?.detail||'Une erreur est survenue.'}
}
