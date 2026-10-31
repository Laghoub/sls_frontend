import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AssessmentPlanningService, PortalAssessment } from './assessment-planning.service';
@Component({selector:'app-assessment-planning-portal',standalone:true,imports:[CommonModule,FormsModule],templateUrl:'./assessment-planning-portal.component.html',styleUrl:'./assessment-planning.component.scss'})
export class AssessmentPlanningPortalComponent implements OnInit {
 audience:'teacher'|'parent'='teacher';route=inject(ActivatedRoute);api=inject(AssessmentPlanningService);items:PortalAssessment[]=[];error='';type='';studentId=0;
 get students(){const m=new Map<number,string>();for(const e of this.items)if(e.student_id)m.set(e.student_id,`${e.student_first_name||''} ${e.student_last_name||''}`.trim());return [...m.entries()].map(([id,name])=>({id,name}))}
 get filtered(){return this.items.filter(e=>(!this.type||e.assessment_type===this.type)&&(this.audience!=='parent'||!this.studentId||e.student_id===+this.studentId))}
 ngOnInit(){this.audience=this.route.snapshot.data['audience']==='parent'?'parent':'teacher';const obs=this.audience==='parent'?this.api.parent():this.api.teacher();obs.subscribe({next:r=>this.items=r,error:()=>this.error='Impossible de charger les calendriers publiés.'})}
}
