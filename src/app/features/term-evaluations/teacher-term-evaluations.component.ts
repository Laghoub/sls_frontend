import {CommonModule} from '@angular/common';
import {Component, OnInit, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {EmployeePortalService} from '../employee-portal/services/employee-portal.service';
import {TeacherAssignment} from '../employee-portal/models/employee-portal.model';
import {TermEvaluationsService,Campaign} from './term-evaluations.service';
interface Option {id:number;code:string;label_fr:string;label_ar?:string;}
interface Criterion {id:number;section:number;code:string;label_fr:string;label_ar?:string;options?:Option[];}
interface Student {student_id:number;first_name:string;last_name:string;evaluation_id?:number; evaluation_status?:string;}
@Component({selector:'app-teacher-term-evaluations',standalone:true,imports:[CommonModule,FormsModule],templateUrl:'./teacher-term-evaluations.component.html',styleUrl:'./teacher-term-evaluations.component.scss'})
export class TeacherTermEvaluationsComponent implements OnInit {
 private api=inject(TermEvaluationsService);private portal=inject(EmployeePortalService);
 campaigns:Campaign[]=[];assignments:TeacherAssignment[]=[];students:Student[]=[];criteria:Criterion[]=[];
 campaignId=0;assignmentId=0;selected?:Student;loading=false;saving=false;error='';message='';
 observations='';difficulties='';recommendations='';answers:Record<number,{optionId:number|null;freeText:string}>={};
 sections=[{id:1,label:'Comportement et discipline',ar:'السلوك والانضباط'},
 {id:2,label:'Travail et participation',ar:'العمل والمشاركة'},
 {id:3,label:'Assiduité et résultats',ar:'المواظبة والنتائج'},
 {id:4,label:'Observations et amélioration',ar:'الملاحظات وخطة التحسين'}];
 ngOnInit(){this.api.teacherCampaigns().subscribe({next:v=>this.campaigns=v,error:()=>this.error='Impossible de charger les campagnes'});
 this.portal.assignments().subscribe({next:v=>this.assignments=v||[],error:()=>this.error='Impossible de charger les affectations'});
 this.api.criteria().subscribe({next:v=>this.criteria=this.normalize(v),error:()=>this.error='Impossible de charger les critères'});}
 get assignment(){return this.assignments.find(x=>x.assignmentId===+this.assignmentId);}
 get campaign(){return this.campaigns.find(x=>x.id===+this.campaignId);}
 normalize(raw:Record<string,unknown>[]):Criterion[]{return raw.map(x=>({
 id:Number(x['id']),section:Number(x['section']),code:String(x['code']||''),
 label_fr:String(x['label_fr']||x['labelFr']||''),label_ar:String(x['label_ar']||x['labelAr']||''),
 options:this.parseOptions(x)
 }));}
 parseOptions(x:Record<string,unknown>):Option[]{
  let raw:unknown=x['options']??x['options_json'];
  if(typeof raw==='string'){try{raw=JSON.parse(raw);}catch{return [];}}
  if(!Array.isArray(raw))return [];
  return (raw as Record<string,unknown>[]).map(o=>({id:Number(o['id']),code:String(o['code']||''),label_fr:String(o['label_fr']||o['labelFr']||''),label_ar:String(o['label_ar']||o['labelAr']||'')}));
 }
 // Choix standard pour les critères ouverts du référentiel. La valeur est sauvegardée dans freeText.
 defaultChoices=['Excellent','Très bon','Bon','Satisfaisant','Moyen','À améliorer','Insuffisant','Non concerné'];
 difficultyChoices=['Aucune difficulté particulière','Compréhension des cours','Concentration','Organisation du travail','Mémorisation','Participation','Méthodologie','Travail personnel','Manque de régularité'];
 recommendationChoices=['Poursuivre les efforts','Réviser quotidiennement les leçons','Faire davantage d’exercices','Participer davantage en classe','Améliorer la concentration','Organiser le travail à domicile','Revoir les notions fondamentales','Demander des explications','Améliorer la régularité des devoirs','Renforcer la lecture'];
 criteriaFor(section:number){return this.criteria.filter(c=>c.section===section);}
 loadStudents(){this.selected=undefined;this.students=[];this.error='';if(!this.campaignId||!this.assignment)return;
 this.loading=true;this.api.teacherStudents(+this.campaignId,this.assignment.classGroupId,this.assignment.subjectId).subscribe({
 next:v=>{this.students=v.map(x=>({student_id:Number(x['student_id']),first_name:String(x['first_name']||''),last_name:String(x['last_name']||''),evaluation_id:x['evaluation_id']?Number(x['evaluation_id']):undefined,evaluation_status:String(x['evaluation_status']||'')}));this.loading=false;},
 error:()=>{this.error='Chargement des élèves impossible';this.loading=false;}});}
 choose(s:Student){this.selected=s;this.message='';this.error='';this.observations='';this.difficulties='';this.recommendations='';this.answers={};
 for(const c of this.criteria)this.answers[c.id]={optionId:null,freeText:''};
 if(s.evaluation_id){
  this.loading=true;
  this.api.teacherEvaluation(s.evaluation_id).subscribe({next:data=>{
   if(this.selected?.evaluation_id!==s.evaluation_id)return;
   this.observations=String(data['observation']??'');
   this.difficulties=String(data['difficulties']??'');
   this.recommendations=String(data['recommendations']??'');
   const rows=Array.isArray(data['answers'])?data['answers'] as Record<string,unknown>[]:[];
   for(const a of rows){const id=Number(a['criterion_id']);if(this.answers[id])this.answers[id]={optionId:a['option_id']==null?null:Number(a['option_id']),freeText:String(a['free_text']??'')};}
   this.loading=false;
  },error:()=>{this.error='Brouillon existant : impossible de recharger les réponses. Vérifiez la mise à jour du backend.';this.loading=false;}});
 }
 }
 canEdit(){return !!this.selected && !['SUBMITTED','APPROVED'].includes(this.selected.evaluation_status||'');}
 save(submit=false){if(!this.selected||!this.assignment||!this.canEdit())return;this.saving=true;this.error='';this.message='';
 const payload={campaignId:+this.campaignId,studentId:this.selected.student_id,classGroupId:this.assignment.classGroupId,subjectId:this.assignment.subjectId,
 observation:this.observations,difficulties:this.difficulties,recommendations:this.recommendations,
 answers:this.criteria.filter(c=>this.answers[c.id]?.optionId!=null||this.answers[c.id]?.freeText?.trim()).map(c=>({criterionId:c.id,optionId:this.answers[c.id]?.optionId??null,freeText:this.answers[c.id]?.freeText||null}))};
 this.api.saveDraft(payload).subscribe({next:res=>{const id=Number((res as Record<string,unknown>)['id']);if(this.selected){this.selected.evaluation_id=id;this.selected.evaluation_status='DRAFT';}
 if(submit){this.api.submit(id).subscribe({next:()=>{if(this.selected)this.selected.evaluation_status='SUBMITTED';this.message='Évaluation soumise';this.saving=false;},error:()=>{this.error='Brouillon enregistré, soumission impossible';this.saving=false;}});}
 else{this.message='Brouillon enregistré';this.saving=false;}},error:()=>{this.error='Enregistrement impossible';this.saving=false;}});}
}
