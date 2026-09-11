import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EnrollmentChoice, SchoolYearRef } from '../../models/finance-reference.model';
import { InstallmentGenerationResponse } from '../../models/finance-tracking.model';
import { FinanceReferenceService } from '../../services/finance-reference.service';
import { FinanceTrackingService } from '../../services/finance-tracking.service';

@Component({selector:'app-installments',standalone:true,imports:[CommonModule,FormsModule],templateUrl:'./installments.component.html',styleUrl:'./installments.component.scss'})
export class InstallmentsComponent {
 private refs=inject(FinanceReferenceService); private tracking=inject(FinanceTrackingService);
 schoolYears=signal<SchoolYearRef[]>([]); enrollments=signal<EnrollmentChoice[]>([]); result=signal<InstallmentGenerationResponse|null>(null); error=signal(''); success=signal('');
 schoolYearId:number|null=null; enrollmentId:number|null=null; fromDate:string|null=null; toDate:string|null=null;
 constructor(){this.refs.schoolYears().subscribe({next:y=>{this.schoolYears.set(y);this.schoolYearId=y.find(x=>x.currentYear)?.id??y[0]?.id??null;this.loadEnrollments();},error:e=>this.error.set(this.msg(e))});}
 loadEnrollments(){if(!this.schoolYearId)return;this.refs.enrollments(this.schoolYearId,0,100).subscribe({next:r=>{this.enrollments.set(r.content);if(!r.content.some(x=>x.id===this.enrollmentId))this.enrollmentId=null;},error:e=>this.error.set(this.msg(e))});}
 generate(){if(!this.enrollmentId)return;this.error.set('');this.success.set('');this.tracking.generateInstallments(this.enrollmentId,{feeTypeId:null,fromDate:this.fromDate||null,toDate:this.toDate||null}).subscribe({next:r=>{this.result.set(r);this.success.set(`${r.createdCount} échéance(s) créée(s), ${r.skippedCount} ignorée(s).`);},error:e=>this.error.set(this.msg(e))});}
 msg(e:any){return e?.error?.message??'Une erreur est survenue.';}
}
