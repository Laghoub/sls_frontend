import { CommonModule } from '@angular/common';import { Component,OnInit,inject,signal } from '@angular/core';import { FormsModule } from '@angular/forms';import { RouterLink } from '@angular/router';import { AuthService } from '../../../../core/config/auth/services/auth.service';import { HrService } from '../../services/hr.service';import { Employee,Teacher,TeacherStatus } from '../../models/hr.model';
@Component({selector:'app-teachers',standalone:true,imports:[CommonModule,FormsModule,RouterLink],templateUrl:'./teachers.component.html',styleUrl:'./teachers.component.scss'})
export class TeachersComponent implements OnInit{private api=inject(HrService);auth=inject(AuthService);teachers=signal<Teacher[]>([]);employees=signal<Employee[]>([]);error=signal('');search='';status='';modal=false;employeeId:number|null=null;teacherStatus:TeacherStatus='ACTIVE';activationTarget:Teacher|null=null;activationSending=false;success=signal('');ngOnInit(){this.load()}load(){
  this.error.set('');
  // La liste des enseignants ne dépend jamais de l'accès au référentiel RH des employés.
  this.api.teachers().subscribe({
    next: teachers => this.teachers.set(teachers),
    error: e => this.error.set(this.msg(e))
  });
  if(this.canCreate){
    this.api.employees().subscribe({
      next: employees => this.employees.set(employees),
      // L'échec de l'API RH ne doit pas vider ni bloquer la liste des enseignants.
      error: () => this.employees.set([])
    });
  }else{
    this.employees.set([]);
  }
}
get canCreate(){return this.auth.hasRole('ADMIN') || this.auth.hasPermission('ENSEIGNANT_CREER')}
get canManage(){return this.auth.hasRole('ADMIN') || this.auth.hasPermission('ENSEIGNANT_MODIFIER') || this.auth.hasPermission('ENSEIGNANT_AFFECTER')}
get canActivate(){return this.auth.hasRole('ADMIN') || this.auth.hasPermission('ENSEIGNANT_MODIFIER')}
get filtered(){const q=this.search.toLowerCase().trim();return this.teachers().filter(t=>(!q||`${t.firstName} ${t.lastName} ${t.employeeNumber} ${t.subjects.map(s=>s.name).join(' ')}`.toLowerCase().includes(q))&&(!this.status||t.status===this.status))}get candidates(){const used=new Set(this.teachers().map(t=>t.employeeId));return this.employees().filter(e=>!used.has(e.id)&&e.status==='ACTIVE')}askActivation(t:Teacher){this.activationTarget=t;this.error.set('');this.success.set('')}closeActivation(){if(!this.activationSending)this.activationTarget=null}sendActivation(){const t=this.activationTarget;if(!t)return;this.activationSending=true;this.api.sendTeacherActivation(t.id).subscribe({next:(r:any)=>{this.activationSending=false;this.activationTarget=null;this.success.set(r?.emailSent===false?'Compte préparé, mais l’e-mail n’a pas pu être envoyé.':'E-mail d’activation enseignant envoyé.')},error:e=>{this.activationSending=false;this.error.set(this.msg(e))}})}create(){if(!this.employeeId)return;this.api.createTeacher({employeeId:this.employeeId,status:this.teacherStatus}).subscribe({next:()=>{this.modal=false;this.employeeId=null;this.load()},error:e=>this.error.set(this.msg(e))})}private msg(e:any){return e?.error?.message||e?.error?.detail||'Une erreur est survenue.'}}
