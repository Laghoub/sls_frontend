import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StaffPayrollService, Attendance, StaffEmployee } from './staff-payroll.service';
@Component({selector:'app-staff-attendance',standalone:true,imports:[CommonModule,FormsModule],template:`
<section class="staff-page"><h2>Pointage du personnel</h2><p>Présences, absences et horaires du personnel non enseignant.</p>
<div class="toolbar"><label>Date <input type="date" [(ngModel)]="date" (change)="load()"></label><button (click)="load()">Actualiser</button></div>
<p class="error" *ngIf="error">{{error}}</p><p class="success" *ngIf="success">{{success}}</p>
<div class="table-wrap"><table><thead><tr><th>Employé</th><th>Statut</th><th>Arrivée</th><th>Départ</th><th>Minutes</th><th>Rémunéré</th><th>Motif / note</th><th></th></tr></thead>
<tbody><tr *ngFor="let e of employees"><td><strong>{{e.first_name}} {{e.last_name}}</strong><br><small>{{e.position_title}}</small></td>
<td><select [(ngModel)]="forms[e.id].status"><option *ngFor="let s of statuses" [value]="s.code">{{s.label}}</option></select></td>
<td><input type="time" [(ngModel)]="forms[e.id].check_in"></td><td><input type="time" [(ngModel)]="forms[e.id].check_out"></td>
<td><input type="number" min="0" [(ngModel)]="forms[e.id].worked_minutes" style="width:85px"></td>
<td><input type="checkbox" [(ngModel)]="forms[e.id].paid"></td><td><input [(ngModel)]="forms[e.id].note" placeholder="Facultatif"></td>
<td><button [disabled]="saving===e.id" (click)="save(e.id)">Enregistrer</button></td></tr></tbody></table></div>
<p *ngIf="!employees.length&&!error">Aucun employé disponible.</p></section>`,styleUrls:['./staff-payroll.scss']})
export class StaffAttendanceComponent implements OnInit {
 private api=inject(StaffPayrollService);
 date=new Date().toLocaleDateString('en-CA'); employees:StaffEmployee[]=[]; forms:Record<number,Attendance>={};error='';success='';saving:number|null=null;
 statuses=[{code:'PRESENT',label:'Présent'},{code:'LATE',label:'Retard'},{code:'ABSENT_EXCUSED',label:'Absence justifiée'},{code:'ABSENT_UNEXCUSED',label:'Absence non justifiée'},{code:'LEAVE',label:'Congé'},{code:'SICK',label:'Maladie'},{code:'REST',label:'Repos'}];
 ngOnInit(){this.load()}
 load(){this.error='';this.api.employees().subscribe({next:employees=>{this.employees=employees;this.api.attendance(this.date,this.date).subscribe({next:marks=>{this.forms={};for(const e of employees){const old=marks.find(a=>a.employee_id===e.id);this.forms[e.id]=old?{...old}:{employee_id:e.id,work_date:this.date,status:'PRESENT',check_in:null,check_out:null,worked_minutes:null,paid:true,note:null}}},error:e=>this.error=this.msg(e)})},error:e=>this.error=this.msg(e)})}
 save(id:number){const a=this.forms[id];this.saving=id;this.error='';this.success='';this.api.mark({employeeId:id,workDate:this.date,status:a.status,checkIn:a.check_in||null,checkOut:a.check_out||null,workedMinutes:a.worked_minutes??null,paid:a.paid,note:a.note||null}).subscribe({next:()=>{this.saving=null;this.success='Pointage enregistré.'},error:e=>{this.saving=null;this.error=this.msg(e)}})}
 private msg(e:any){return e?.error?.detail||e?.error?.message||'Erreur lors du chargement ou de l’enregistrement.'}
}
