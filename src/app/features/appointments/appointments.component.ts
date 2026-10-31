import {CommonModule} from '@angular/common';
import {Component,inject,OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {AppointmentsService} from './appointments.service';
@Component({selector:'app-appointments',standalone:true,imports:[CommonModule,FormsModule],templateUrl:'./appointments.component.html',styleUrl:'./appointments.component.scss'})
export class AppointmentsComponent implements OnInit {
 private api=inject(AppointmentsService); children:any[]=[]; teachers:any[]=[]; requests:any[]=[];
 childId:number|null=null; teacherKey=''; reason=''; preferredTimes=''; busy=false; error=''; success='';
 ngOnInit(){this.api.children().subscribe({next:r=>{this.children=r;this.childId=r.length?Number(r[0].id):null;this.loadTeachers()},error:e=>this.fail(e)});this.refresh()}
 loadTeachers(){this.teachers=[];this.teacherKey='';if(this.childId)this.api.teachers(this.childId).subscribe({next:r=>this.teachers=r,error:e=>this.fail(e)})}
 refresh(){this.api.parentList().subscribe({next:r=>this.requests=r.filter((a:any)=>a.origin!=='TEACHER'||a.status==='CONFIRMED'),error:e=>this.fail(e)})}
 submit(){if(!this.childId||!this.teacherKey||!this.reason.trim())return;const [teacherId,subjectId]=this.teacherKey.split(':').map(Number);this.busy=true;this.error='';this.api.create({studentId:this.childId,teacherId,subjectId,reason:this.reason.trim(),preferredTimes:this.preferredTimes}).subscribe({next:()=>{this.busy=false;this.success='Demande envoyée à l’administration.';this.reason='';this.preferredTimes='';this.refresh()},error:e=>{this.busy=false;this.fail(e)}})}
 cancel(id:number){if(!confirm('Annuler cette demande ?'))return;this.api.cancel(id).subscribe({next:()=>this.refresh(),error:e=>this.fail(e)})}
 label(s:string){return ({PENDING:'En attente',CONFIRMED:'Confirmé',REJECTED:'Refusé',CANCELLED:'Annulé'} as Record<string,string>)[s]||s}
 private fail(e:any){this.error=e?.error?.message||e?.error?.detail||'Une erreur est survenue.'}
}
