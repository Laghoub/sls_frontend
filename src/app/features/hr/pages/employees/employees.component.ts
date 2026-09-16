import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin, switchMap } from 'rxjs';
import { HrService } from '../../services/hr.service';
import { Employee, EmployeeRequest, EmploymentStatus, JobPosition } from '../../models/hr.model';
import { CampusService } from '../../../school/campuses/services/campus.service';
import { Campus } from '../../../school/campuses/models/campus.model';
import { PersonService } from '../../../student/services/person.service';
import { Person } from '../../../student/models/person.model';

@Component({selector:'app-employees',standalone:true,imports:[CommonModule,FormsModule,RouterLink],templateUrl:'./employees.component.html',styleUrl:'./employees.component.scss'})
export class EmployeesComponent implements OnInit{
  private api=inject(HrService); private campusesApi=inject(CampusService); private peopleApi=inject(PersonService);
  employees=signal<Employee[]>([]); campuses=signal<Campus[]>([]); positions=signal<JobPosition[]>([]); people=signal<Person[]>([]); loading=signal(false); error=signal(''); success=signal('');
  modal=false; saving=false; search=''; status=''; campusId:number|null=null; positionId:number|null=null; personMode:'new'|'existing'='new'; personSearch='';
  person={firstName:'',lastName:'',birthDate:null as string|null,birthPlace:null as string|null,nationality:null as string|null,sex:null as string|null,address:null as string|null,phone:null as string|null,secondaryPhone:null as string|null,email:null as string|null,photoReference:null as string|null};
  request:EmployeeRequest={personId:0,socialSecurityNumber:null,positionId:null,positionTitle:null,campusId:null,hireDate:new Date().toISOString().slice(0,10),endDate:null,employmentStatus:'ACTIVE',maritalStatus:null};
  statuses:{value:EmploymentStatus,label:string}[]=[{value:'ACTIVE',label:'Actif'},{value:'ON_LEAVE',label:'En congé'},{value:'SUSPENDED',label:'Suspendu'},{value:'ENDED',label:'Sorti'}];
  ngOnInit(){this.loading.set(true);forkJoin({e:this.api.employees(),c:this.campusesApi.getAll(),p:this.api.jobPositions(false)}).subscribe({next:r=>{this.employees.set(r.e);this.campuses.set(r.c);this.positions.set(r.p);this.loading.set(false)},error:e=>{this.loading.set(false);this.error.set(this.msg(e))}})}
  get filtered(){const q=this.search.toLowerCase().trim();return this.employees().filter(e=>(!q||`${e.firstName} ${e.lastName} ${e.employeeNumber} ${e.positionTitle}`.toLowerCase().includes(q))&&(!this.status||e.status===this.status)&&(!this.campusId||e.campusId===this.campusId)&&(!this.positionId||e.positionId===this.positionId))}
  open(){this.modal=true;this.error.set('');this.success.set('')}
  close(){this.modal=false}
  searchPeople(){if(this.personSearch.trim().length<2){this.people.set([]);return}this.peopleApi.getAll(this.personSearch).subscribe({next:v=>this.people.set(v),error:e=>this.error.set(this.msg(e))})}
  selectPerson(p:Person){this.request.personId=p.id;this.personSearch=`${p.firstName} ${p.lastName}`;this.people.set([])}
  create(){if(!this.request.positionId){this.error.set('Le poste est obligatoire et doit être sélectionné dans la liste.');return}if(this.personMode==='existing'&&!this.request.personId){this.error.set('Sélectionnez une personne existante.');return}this.saving=true;this.error.set('');const createEmployee=()=>this.api.createEmployee(this.request);const obs=this.personMode==='new'?this.peopleApi.create(this.person).pipe(switchMap(p=>{this.request.personId=p.id;return createEmployee()})):createEmployee();obs.subscribe({next:e=>{this.employees.update(v=>[...v,e].sort((a,b)=>a.lastName.localeCompare(b.lastName)));this.saving=false;this.modal=false;this.success.set(`Dossier ${e.employeeNumber} créé.`);this.reset()},error:e=>{this.saving=false;this.error.set(this.msg(e))}})}
  reset(){this.request={personId:0,socialSecurityNumber:null,positionId:null,positionTitle:null,campusId:null,hireDate:new Date().toISOString().slice(0,10),endDate:null,employmentStatus:'ACTIVE',maritalStatus:null};this.person={firstName:'',lastName:'',birthDate:null,birthPlace:null,nationality:null,sex:null,address:null,phone:null,secondaryPhone:null,email:null,photoReference:null};this.personSearch='';this.people.set([])}
  labelStatus(s:string){return this.statuses.find(x=>x.value===s)?.label??s}
  statusClass(s:string){return s==='ACTIVE'?'active':s==='ON_LEAVE'?'warn':'danger'}
  private msg(e:any){return e?.error?.message||e?.error?.detail||'Une erreur est survenue.'}
}
