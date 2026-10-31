import {CommonModule} from '@angular/common';
import {Component,inject,OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {AppointmentsService} from './appointments.service';
@Component({selector:'app-teacher-appointments',standalone:true,imports:[CommonModule,FormsModule],templateUrl:'./teacher-appointments.component.html',styleUrl:'./appointments.component.scss'})
export class TeacherAppointmentsComponent implements OnInit {
 private api=inject(AppointmentsService);
 rows:any[]=[];summons:any[]=[];students:any[]=[];error='';success='';busy=false;showForm=false;
 studentId:number|null=null;subjectId:number|null=null;reason='';start='';end='';place='';
 ngOnInit(){this.refresh()}
 refresh(){this.api.teacherList().subscribe({next:r=>this.rows=r,error:e=>this.fail(e)});this.api.teacherSummons().subscribe({next:r=>this.summons=r,error:e=>this.fail(e)});this.api.teacherStudents().subscribe({next:r=>this.students=r,error:e=>this.fail(e)})}
 get availableSubjects(){return this.students.filter(s=>Number(s.student_id)===Number(this.studentId))}
 get uniqueStudents(){return this.students.filter((s,i,a)=>a.findIndex(x=>Number(x.student_id)===Number(s.student_id))===i)}
 onStudentChange(){this.subjectId=null}
 submit(){this.error='';this.success='';if(!this.studentId||!this.subjectId||!this.reason.trim()||!this.start||!this.end){this.error='Veuillez compléter tous les champs obligatoires.';return}
 const begins=new Date(this.start),ends=new Date(this.end);
 if(!(ends>begins)||!(begins>new Date())){this.error='La date doit être future et la fin postérieure au début.';return}
 this.busy=true;this.api.createSummons({studentId:Number(this.studentId),subjectId:Number(this.subjectId),reason:this.reason.trim(),startsAt:begins.toISOString(),endsAt:ends.toISOString(),meetingPlace:this.place.trim()}).subscribe({next:()=>{this.busy=false;this.showForm=false;this.reason='';this.start='';this.end='';this.place='';this.studentId=null;this.subjectId=null;this.success='Convocation transmise à l’administration pour validation.';this.refresh()},error:e=>{this.busy=false;this.fail(e)}})}
 private fail(e:any){this.error=e?.error?.message||e?.error?.detail||'Opération impossible.'}
}
