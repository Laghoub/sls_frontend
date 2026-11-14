import { PaginatedTableDirective } from '../../shared/directives/paginated-table.directive';
import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnChanges, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { FinanceReferenceService } from '../finance/services/finance-reference.service';
import { HrService } from '../hr/services/hr.service';
import { PedagogyListsService, PedagogyListRow, ListFilters } from './pedagogy-lists.service';
import { CycleRef, SchoolYearRef, ClassGroupRef, LevelRef } from '../finance/models/finance-reference.model';
@Component({selector:'app-pedagogy-lists',standalone:true,imports: [PaginatedTableDirective, CommonModule,FormsModule],templateUrl:'./pedagogy-lists.component.html',styleUrl:'./pedagogy-lists.component.scss'})
export class PedagogyListsComponent implements OnInit,OnChanges {
  @Input() kind:'students'|'teachers'='students';
  private api=inject(PedagogyListsService);private refs=inject(FinanceReferenceService);private hr=inject(HrService);
  years:SchoolYearRef[]=[];cycles:CycleRef[]=[];classes:ClassGroupRef[]=[];levels:LevelRef[]=[];subjects:{id:number;name:string}[]=[];
  schoolYearId:number|null=null;cycleId:number|null=null;classId:number|null=null;subjectId:number|null=null;
  rows:PedagogyListRow[]=[];search='';loading=false;exporting=false;error='';
  get isTeachers(){return this.kind==='teachers'}
  get title(){return this.isTeachers?'Liste des enseignants':'Liste des élèves'}
  get filteredClasses(){return this.classes.filter(c=>(!this.schoolYearId||c.schoolYearId===this.schoolYearId)&&(!this.cycleId||this.levels.some(l=>l.id===c.levelId&&l.cycleId===this.cycleId)));}
  get visibleRows(){const q=this.search.trim().toLocaleLowerCase();return !q?this.rows:this.rows.filter(r=>[r['nom'],r['prenom'],r['matricule'],r['classe'],r['matiere']].some(v=>String(v??'').toLocaleLowerCase().includes(q)));}
  ngOnInit(){forkJoin({years:this.refs.schoolYears(),cycles:this.refs.cycles(),classes:this.refs.classGroups(),levels:this.refs.levels(),subjects:this.hr.subjects()}).subscribe({next:r=>{this.years=r.years;this.cycles=r.cycles;this.classes=r.classes;this.levels=r.levels;this.subjects=r.subjects;this.schoolYearId=r.years.find(y=>y.currentYear||y.status==='ACTIVE')?.id??null;this.load();},error:()=>{this.error='Impossible de charger les filtres. Vérifiez les autorisations.';}});}
  ngOnChanges(){this.rows=[];this.search='';if(this.years.length)this.load();}
  onCycleChange(){this.classId=null;this.load();}
  onYearChange(){this.classId=null;this.load();}
  filters():ListFilters{return {schoolYearId:this.schoolYearId,cycleId:this.cycleId,classId:this.classId,...(this.isTeachers?{subjectId:this.subjectId}:{})};}
  load(){this.loading=true;this.error='';this.api.list(this.kind,this.filters()).subscribe({next:r=>{this.rows=r;this.loading=false;},error:err=>{this.rows=[];this.loading=false;this.error=err?.error?.detail||'Impossible de charger la liste. Vérifiez les permissions et le backend.';}});}
  exportPdf(){this.exporting=true;this.error='';this.api.pdf(this.kind,this.filters()).subscribe({next:blob=>{this.exporting=false;const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=this.isTeachers?'liste_enseignants.pdf':'liste_eleves.pdf';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);},error:()=>{this.exporting=false;this.error='Échec de la génération PDF.';}});}
  value(row:PedagogyListRow,key:string){return row[key]==null?'—':String(row[key]);}
}

@Component({selector:'app-pedagogy-teachers-list',standalone:true,imports:[PedagogyListsComponent],template:'<app-pedagogy-lists kind="teachers" />'})
export class PedagogyTeachersListComponent {}
