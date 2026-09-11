import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GuardianChoice, SchoolYearRef } from '../../models/finance-reference.model';
import { FamilyCredit } from '../../models/finance.model';
import { FamilyCreditUsage, FamilyFinancialSituation, FinancialChargeLine } from '../../models/finance-tracking.model';
import { FamilyCreditService } from '../../services/family-credit.service';
import { FinanceReferenceService } from '../../services/finance-reference.service';
import { FinanceTrackingService } from '../../services/finance-tracking.service';

@Component({
  selector: 'app-family-credits',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './family-credits.component.html',
  styleUrl: './family-credits.component.scss',
})
export class FamilyCreditsComponent {
  private s = inject(FamilyCreditService);
  private refs = inject(FinanceReferenceService);
  private tracking = inject(FinanceTrackingService);

  guardians = signal<GuardianChoice[]>([]);
  selected = signal<GuardianChoice | null>(null);
  schoolYears = signal<SchoolYearRef[]>([]);
  situation = signal<FamilyFinancialSituation | null>(null);
  items = signal<FamilyCredit[]>([]);
  usages = signal<FamilyCreditUsage[]>([]);
  selectedCredit = signal<FamilyCredit | null>(null);
  applyModal = signal(false);
  page = signal(0); size = signal(20); total = signal(0); pages = signal(0);
  error = signal(''); success = signal(''); search = '';
  schoolYearId: number | null = null;
  chargeId: number | null = null;
  applyAmount = 0;

  constructor(){
    this.refs.schoolYears().subscribe({next:y=>{this.schoolYears.set(y);this.schoolYearId=y.find(x=>x.currentYear)?.id??y[0]?.id??null;},error:e=>this.error.set(this.msg(e))});
  }

  searchGuardians(){this.refs.guardians(this.search,0,10).subscribe({next:r=>this.guardians.set(r.content),error:e=>this.error.set(this.msg(e))});}
  choose(g:GuardianChoice){this.selected.set(g);this.guardians.set([]);this.page.set(0);this.load();this.loadSituation();}
  load(){if(!this.selected())return;this.s.search(this.selected()!.id,this.page(),this.size()).subscribe({next:r=>{this.items.set(r.content);this.total.set(r.totalElements);this.pages.set(r.totalPages);},error:e=>this.error.set(this.msg(e))});}
  loadSituation(){if(!this.selected()||!this.schoolYearId)return;this.tracking.family(this.selected()!.id,this.schoolYearId).subscribe({next:x=>this.situation.set(x),error:e=>this.error.set(this.msg(e))});}
  openApply(c:FamilyCredit){this.selectedCredit.set(c);this.chargeId=null;this.applyAmount=Math.max(0,Number(c.remainingAmount));this.usages.set([]);this.s.usages(c.id).subscribe({next:x=>this.usages.set(x),error:e=>this.error.set(this.msg(e))});this.applyModal.set(true);}
  outstandingCharges():FinancialChargeLine[]{return this.situation()?.students.flatMap(s=>s.charges).filter(c=>c.remainingAmount>0&&c.status!=='CANCELLED')??[];}
  apply(){const c=this.selectedCredit();if(!c||!this.chargeId||this.applyAmount<=0)return;this.error.set('');this.s.apply(c.id,{studentChargeId:this.chargeId,amount:Number(this.applyAmount)}).subscribe({next:u=>{this.success.set(`Avoir appliqué : ${Number(u.amount).toFixed(2)}`);this.applyModal.set(false);this.load();this.loadSituation();},error:e=>this.error.set(this.msg(e))});}
  prev(){if(this.page()>0){this.page.update(v=>v-1);this.load();}}
  next(){if(this.page()+1<this.pages()){this.page.update(v=>v+1);this.load();}}
  msg(e:any){return e?.error?.message??'Une erreur est survenue.';}
}
