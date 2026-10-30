import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TermEvaluationsService, Campaign } from './term-evaluations.service';
@Component({selector:'app-term-evaluations',standalone:true,imports:[CommonModule,FormsModule,RouterLink],templateUrl:'./term-evaluations.component.html',styleUrl:'./term-evaluations.component.scss'})
export class TermEvaluationsComponent implements OnInit {
 private api=inject(TermEvaluationsService);
 campaigns:Campaign[]=[]; selected?:Campaign; evaluations:Record<string,unknown>[]=[]; progress:Record<string,unknown>[]=[];
 detail?:Record<string,unknown>; detailLoading=false;
 expected:Record<string,unknown>[]=[]; selectedIds=new Set<number>(); subjectFilter=0; levelFilter=0; classFilter=0;
 get subjectOptions(){return [...new Map(this.evaluations.map(e=>[Number(e['subject_id']),String(e['subject_name']||e['subject_id'])])).entries()].sort((a,b)=>a[1].localeCompare(b[1]));}
 get classOptions(){return [...new Map(this.evaluations.map(e=>[Number(e['class_group_id']),String(e['class_name']||e['class_group_id'])])).entries()].sort((a,b)=>a[1].localeCompare(b[1]));}
 get levelOptions(){return [...new Map(this.evaluations.filter(e=>e['level_id']!=null).map(e=>[Number(e['level_id']),String(e['level_name']||e['level_id'])])).entries()].sort((a,b)=>a[1].localeCompare(b[1]));}
 get visibleEvaluations(){return this.evaluations.filter(e=>(!this.subjectFilter||Number(e['subject_id'])===this.subjectFilter)&&(!this.levelFilter||Number(e['level_id'])===this.levelFilter)&&(!this.classFilter||Number(e['class_group_id'])===this.classFilter));}
 get selectedCount(){return this.selectedIds.size;}
 get eligibleVisible(){return this.visibleEvaluations.filter(e=>e['status']==='SUBMITTED');}
 toggleOne(e:Record<string,unknown>,checked:boolean){const id=Number(e['id']);if(checked)this.selectedIds.add(id);else this.selectedIds.delete(id);}
 toggleAll(checked:boolean){for(const e of this.eligibleVisible)this.toggleOne(e,checked);}
 bulkApprove(){const ids=[...this.selectedIds];if(!ids.length)return;if(!window.confirm(`Approuver ${ids.length} évaluation(s) sélectionnée(s) ?`))return;this.api.approveBulk(ids).subscribe({next:r=>{this.message=`${r.approved} évaluation(s) approuvée(s)`;this.selectedIds.clear();if(this.selected)this.select(this.selected);},error:e=>this.error=e?.error?.detail||'Validation multiple impossible'});}
 get expectedTotal(){return this.expected.reduce((n,r)=>n+Number(r['expected_count']||0),0);}
 get expectedApproved(){return this.expected.reduce((n,r)=>n+Number(r['approved_count']||0),0);}

 get detailAnswers():Record<string,unknown>[]{return (this.detail?.['answers'] as Record<string,unknown>[])||[];}
 get detailReviews():Record<string,unknown>[]{return (this.detail?.['reviews'] as Record<string,unknown>[])||[];}
 get submittedCount(){return this.evaluations.filter(e=>e['status']==='SUBMITTED').length;}
 get approvedCount(){return this.evaluations.filter(e=>e['status']==='APPROVED').length;}
 get draftCount(){return this.evaluations.filter(e=>e['status']==='DRAFT').length;}
 get returnedCount(){return this.evaluations.filter(e=>e['status']==='RETURNED').length;}
 view(e:Record<string,unknown>){this.detail=undefined;this.detailLoading=true;this.api.detail(Number(e['id'])).subscribe({next:r=>{this.detail=r;this.detailLoading=false;},error:()=>{this.detailLoading=false;this.error='Consultation impossible';}});}
 loading=false; error=''; message='';
 form={schoolYearId:0,title:'Évaluation du 1er trimestre',trimester:1,cycleCode:'',evaluationFrom:'',evaluationTo:'',opensAt:'',closesAt:''};
 ngOnInit(){this.refresh();}
 refresh(){this.loading=true;this.api.campaigns().subscribe({next:r=>{this.campaigns=r;this.loading=false;},error:()=>{this.error='Impossible de charger les campagnes';this.loading=false;}});}
 create(){this.error='';const f=this.form;if(!f.schoolYearId||!f.evaluationFrom||!f.evaluationTo||!f.opensAt||!f.closesAt){this.error='Renseignez les champs obligatoires.';return;}
 this.api.create({...f,cycleCode:f.cycleCode||null,opensAt:new Date(f.opensAt).toISOString(),closesAt:new Date(f.closesAt).toISOString()}).subscribe({next:()=>{this.message='Campagne créée';this.refresh();},error:e=>this.error=e.error?.message||'Création impossible'});}
 schedule(c:Campaign){this.api.schedule(c.id).subscribe({next:()=>this.refresh(),error:()=>this.error='Programmation impossible'});}
 select(c:Campaign){this.selected=c;this.detail=undefined;this.selectedIds.clear();this.error='';this.api.evaluations(c.id).subscribe({next:r=>this.evaluations=r,error:()=>this.error='Chargement des évaluations impossible'});this.api.expected(c.id).subscribe({next:r=>this.expected=r,error:()=>this.error='Calcul du total attendu impossible'});this.api.progress(c.id).subscribe({next:r=>this.progress=r,error:()=>this.error='Chargement du suivi impossible'});}
 approve(e:Record<string,unknown>){this.api.approve(Number(e['id'])).subscribe({next:()=>{this.detail=undefined;if(this.selected)this.select(this.selected);},error:()=>this.error='Approbation impossible'});}
 publishStudentId(e:Record<string,unknown>){this.publishStudent(Number(e['student_id']));}
 publishStudent(studentId:number){if(!this.selected)return;
  if(!window.confirm('Publier le bilan de cet élève aux parents ?'))return;
  this.api.publishStudent(this.selected.id,studentId).subscribe({next:()=>{this.message='Rapport publié';this.select(this.selected!);},error:e=>this.error=e?.error?.message||'Publication impossible : vérifiez les évaluations approuvées'});
 }
 returnEvaluation(e:Record<string,unknown>){const reason=window.prompt('Motif du retour pour correction :');if(!reason?.trim())return;this.api.returnForCorrection(Number(e['id']),reason.trim()).subscribe({next:()=>{this.detail=undefined;if(this.selected)this.select(this.selected);},error:()=>this.error='Retour impossible'});}
}
