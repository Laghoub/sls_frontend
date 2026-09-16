import { CommonModule } from '@angular/common';
import { Component,OnInit,inject,signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute,RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { HrService } from '../../services/hr.service';
import { Employee,EmployeeProfile,EmployeeRequest,EmploymentStatus,JobPosition } from '../../models/hr.model';
import { CampusService } from '../../../school/campuses/services/campus.service';
import { Campus } from '../../../school/campuses/models/campus.model';
@Component({selector:'app-employee-detail',standalone:true,imports:[CommonModule,FormsModule,RouterLink],templateUrl:'./employee-detail.component.html',styleUrl:'./employee-detail.component.scss'})
export class EmployeeDetailComponent implements OnInit{
 private route=inject(ActivatedRoute);private api=inject(HrService);private campusesApi=inject(CampusService);id=Number(this.route.snapshot.paramMap.get('id'));employee=signal<Employee|null>(null);profile=signal<EmployeeProfile|null>(null);campuses=signal<Campus[]>([]);positions=signal<JobPosition[]>([]);error=signal('');success=signal('');tab='general';modal='';
 edit:EmployeeRequest={personId:0,socialSecurityNumber:null,positionId:null,positionTitle:null,campusId:null,hireDate:null,endDate:null,employmentStatus:'ACTIVE',maritalStatus:null};form:any={};statuses:{value:EmploymentStatus,label:string}[]=[{value:'ACTIVE',label:'Actif'},{value:'ON_LEAVE',label:'En congé'},{value:'SUSPENDED',label:'Suspendu'},{value:'ENDED',label:'Sorti'}];
 ngOnInit(){this.load();forkJoin({c:this.campusesApi.getAll(),p:this.api.jobPositions(false)}).subscribe({next:r=>{this.campuses.set(r.c);this.positions.set(r.p)},error:e=>this.error.set(this.msg(e))})}
 load(){forkJoin({e:this.api.employee(this.id),p:this.api.employeeProfile(this.id)}).subscribe({next:r=>{this.employee.set(r.e);this.profile.set(r.p);this.edit={personId:r.e.personId,socialSecurityNumber:null,positionId:r.e.positionId,positionTitle:null,campusId:r.e.campusId,hireDate:r.e.hireDate,endDate:r.e.endDate,employmentStatus:r.e.status,maritalStatus:null}},error:e=>this.error.set(this.msg(e))})}
 save(){if(!this.edit.positionId){this.error.set('Sélectionnez un poste dans le référentiel.');return}this.api.updateEmployee(this.id,this.edit).subscribe({next:e=>{this.employee.set(e);this.success.set('Dossier professionnel mis à jour.')},error:e=>this.error.set(this.msg(e))})}
 changeStatus(s:EmploymentStatus){this.api.changeEmployeeStatus(this.id,s).subscribe({next:()=>{this.edit.employmentStatus=s;this.load()},error:e=>this.error.set(this.msg(e))})}
 open(type:string){this.modal=type;this.form={};if(type==='contract')this.form={status:'ACTIVE'};if(type==='contact')this.form={primaryContact:false};if(type==='document')this.form={status:'VALID'}} close(){this.modal=''}
 submit(){let obs:any;switch(this.modal){case'qualification':obs=this.api.addQualification(this.id,this.form);break;case'history':obs=this.api.addHistory(this.id,this.form);break;case'contract':obs=this.api.addContract(this.id,this.form);break;case'contact':obs=this.api.addEmergencyContact(this.id,this.form);break;case'document':obs=this.api.addDocument(this.id,this.form);break;case'note':obs=this.api.addNote(this.id,this.form);break;default:return}obs.subscribe({next:()=>{this.close();this.success.set('Information ajoutée.');this.load()},error:(e:any)=>this.error.set(this.msg(e))})}
 date(v:any){return v?new Date(v).toLocaleDateString('fr-FR'):'—'} private msg(e:any){return e?.error?.message||e?.error?.detail||'Une erreur est survenue.'}
}
