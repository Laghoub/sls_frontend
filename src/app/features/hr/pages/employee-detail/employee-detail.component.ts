import { PaginatedTableDirective } from '../../../../shared/directives/paginated-table.directive';
import { CommonModule } from '@angular/common';
import { Component,OnInit,inject,signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute,RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PersonService } from '../../../student/services/person.service';
import { Person, PersonCreateRequest } from '../../../student/models/person.model';
import { AuthService } from '../../../../core/config/auth/services/auth.service';
import { HrService } from '../../services/hr.service';
import { Employee,EmployeeProfile,EmployeeRequest,EmploymentStatus,JobPosition } from '../../models/hr.model';
import { CampusService } from '../../../school/campuses/services/campus.service';
import { Campus } from '../../../school/campuses/models/campus.model';
@Component({selector:'app-employee-detail',standalone:true,imports: [PaginatedTableDirective, CommonModule,FormsModule,RouterLink],templateUrl:'./employee-detail.component.html',styleUrl:'./employee-detail.component.scss'})
export class EmployeeDetailComponent implements OnInit{
 private route=inject(ActivatedRoute);private api=inject(HrService);private campusesApi=inject(CampusService);private personsApi=inject(PersonService);private auth=inject(AuthService);id=Number(this.route.snapshot.paramMap.get('id'));employee=signal<Employee|null>(null);profile=signal<EmployeeProfile|null>(null);campuses=signal<Campus[]>([]);positions=signal<JobPosition[]>([]);error=signal('');success=signal('');tab='general';modal='';person=signal<Person|null>(null);personEdit:PersonCreateRequest|null=null;editingPerson=false;savingPerson=false;savingEmployee=false;
 get canEditPerson(){return this.auth.hasRole('ADMIN')||this.auth.hasPermission('PERSONNE_MODIFIER')}
 get canEditEmployee(){return this.auth.hasRole('ADMIN')||this.auth.hasPermission('PERSONNEL_MODIFIER')}
 edit:EmployeeRequest={personId:0,socialSecurityNumber:null,positionId:null,positionTitle:null,campusId:null,hireDate:null,endDate:null,employmentStatus:'ACTIVE',maritalStatus:null};form:any={};statuses:{value:EmploymentStatus,label:string}[]=[{value:'ACTIVE',label:'Actif'},{value:'ON_LEAVE',label:'En congé'},{value:'SUSPENDED',label:'Suspendu'},{value:'ENDED',label:'Sorti'}];
 ngOnInit(){this.load();forkJoin({c:this.campusesApi.getAll(),p:this.api.jobPositions(false)}).subscribe({next:r=>{this.campuses.set(r.c);this.positions.set(r.p)},error:e=>this.error.set(this.msg(e))})}
 load(){forkJoin({e:this.api.employee(this.id),p:this.api.employeeProfile(this.id)}).subscribe({next:r=>{this.employee.set(r.e);this.profile.set(r.p);this.personsApi.getById(r.e.personId).subscribe({next:person=>{this.person.set(person);this.personEdit=this.personRequest(person)},error:err=>this.error.set('Impossible de charger les informations personnelles : '+this.msg(err))});this.edit={personId:r.e.personId,socialSecurityNumber:r.e.socialSecurityNumber??null,positionId:r.e.positionId,positionTitle:null,campusId:r.e.campusId,hireDate:r.e.hireDate,endDate:r.e.endDate,employmentStatus:r.e.status,maritalStatus:r.e.maritalStatus??null}},error:e=>this.error.set(this.msg(e))})}
 private personRequest(p:Person):PersonCreateRequest{return {lastName:p.lastName,firstName:p.firstName,birthDate:p.birthDate,birthPlace:p.birthPlace,nationality:p.nationality,sex:p.sex,address:p.address,phone:p.phone,secondaryPhone:p.secondaryPhone,email:p.email,photoReference:p.photoReference}}
 startPersonEdit(){if(!this.canEditPerson||!this.person())return;this.personEdit=this.personRequest(this.person()!);this.editingPerson=true;this.error.set('');this.success.set('')}
 cancelPersonEdit(){if(this.person())this.personEdit=this.personRequest(this.person()!);this.editingPerson=false}
 savePerson(){if(!this.canEditPerson||!this.personEdit||!this.person()||this.savingPerson)return;
  if(!this.personEdit.lastName.trim()||!this.personEdit.firstName.trim()){this.error.set('Le nom et le prénom sont obligatoires.');return}
  this.savingPerson=true;this.error.set('');this.success.set('');
  this.personsApi.update(this.person()!.id,this.personEdit).subscribe({next:p=>{this.person.set(p);this.personEdit=this.personRequest(p);this.editingPerson=false;this.savingPerson=false;this.success.set('Informations personnelles mises à jour.');this.load()},error:e=>{this.savingPerson=false;this.error.set(this.msg(e))}})
 }
 save(){if(!this.canEditEmployee||this.savingEmployee)return;if(!this.edit.positionId){this.error.set('Sélectionnez un poste dans le référentiel.');return}
  this.savingEmployee=true;this.error.set('');this.success.set('');this.api.updateEmployee(this.id,this.edit).subscribe({next:e=>{this.employee.set(e);this.edit={...this.edit,socialSecurityNumber:e.socialSecurityNumber??null,maritalStatus:e.maritalStatus??null};this.savingEmployee=false;this.success.set('Dossier professionnel mis à jour.')},error:e=>{this.savingEmployee=false;this.error.set(this.msg(e))}})}
 changeStatus(s:EmploymentStatus){this.api.changeEmployeeStatus(this.id,s).subscribe({next:()=>{this.edit.employmentStatus=s;this.load()},error:e=>this.error.set(this.msg(e))})}
 open(type:string){this.modal=type;this.form={};if(type==='contract')this.form={status:'ACTIVE'};if(type==='contact')this.form={primaryContact:false};if(type==='document')this.form={status:'VALID'}} close(){this.modal=''}
 submit(){let obs:any;switch(this.modal){case'qualification':obs=this.api.addQualification(this.id,this.form);break;case'history':obs=this.api.addHistory(this.id,this.form);break;case'contract':obs=this.api.addContract(this.id,this.form);break;case'contact':obs=this.api.addEmergencyContact(this.id,this.form);break;case'document':obs=this.api.addDocument(this.id,this.form);break;case'note':obs=this.api.addNote(this.id,this.form);break;default:return}obs.subscribe({next:()=>{this.close();this.success.set('Information ajoutée.');this.load()},error:(e:any)=>this.error.set(this.msg(e))})}
 date(v:any){return v?new Date(v).toLocaleDateString('fr-FR'):'—'} private msg(e:any){return e?.error?.message||e?.error?.detail||'Une erreur est survenue.'}
}
