import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { StaffPayrollService, Contract, PayRun, StaffEmployee, PaymentReceipt } from './staff-payroll.service';
@Component({selector:'app-staff-payroll',standalone:true,imports:[CommonModule,FormsModule],template:`
<section class="staff-page"><h2>Paie du personnel</h2><p>Contrats, calcul, validation et versements des salaires.</p>
<div class="toolbar"><label>Mois <input type="month" [(ngModel)]="month" (change)="loadRuns()"></label><button (click)="loadRuns()">Actualiser</button></div>
<p class="error" *ngIf="error">{{error}}</p><p class="success" *ngIf="success">{{success}}</p>
<div class="staff-card" *ngIf="lastReceipt"><p class="success">Paiement enregistré en caisse selon le mode de règlement. Reçu {{lastReceipt.receipt_number}}</p><button (click)="openReceipt(lastReceipt.payment_id)">🖨️ Afficher et imprimer le reçu</button></div>
<div class="staff-card"><h3>Contrat de rémunération</h3><div class="form-grid"><label>Employé<select [(ngModel)]="employeeId" (change)="loadContracts()"><option [ngValue]="0">Sélectionner</option><option *ngFor="let e of employees" [ngValue]="e.id">{{e.first_name}} {{e.last_name}} — {{e.position_title}}</option></select></label>
<label>Type<select [(ngModel)]="payType"><option value="MONTHLY">Mensuel</option><option value="DAILY">Journalier</option><option value="HOURLY">Horaire</option></select></label>
<label>Tarif (DA)<input type="number" min="0" [(ngModel)]="baseRate"></label><label>Début<input type="date" [(ngModel)]="effectiveFrom"></label>
<label>Fin (facultatif)<input type="date" [(ngModel)]="effectiveTo"></label></div><button [disabled]="busy||!employeeId" (click)="saveContract()">Créer le contrat</button>
<p *ngFor="let c of contracts">{{c.pay_type}} — {{c.base_rate | number:'1.2-2'}} DA — du {{c.effective_from}} au {{c.effective_to||'sans fin'}}</p></div>
<div class="staff-card"><h3>Calculer la paie</h3><div class="form-grid"><label>Prime (DA)<input type="number" min="0" [(ngModel)]="bonus"></label><label>Retenue (DA)<input type="number" min="0" [(ngModel)]="deduction"></label><label>Note<input [(ngModel)]="note"></label></div>
<button [disabled]="busy||!employeeId" (click)="calculate()">Calculer pour l'employé sélectionné</button><small>Les montants sont des calculs internes simplifiés, sans paie réglementaire complète.</small></div>
<div class="staff-card"><h3>Paies du mois</h3><div class="table-wrap"><table><thead><tr><th>Employé</th><th>Base</th><th>Prime</th><th>Retenue</th><th>Net</th><th>Payé</th><th>Reste</th><th>Statut</th><th>Actions</th></tr></thead>
<tbody><tr *ngFor="let r of runs"><td>{{name(r.employee_id)}}</td><td>{{r.base_amount|number:'1.2-2'}}</td><td>{{r.bonus_amount|number:'1.2-2'}}</td><td>{{r.deduction_amount|number:'1.2-2'}}</td><td><b>{{r.net_amount|number:'1.2-2'}}</b></td><td>{{r.paid_amount|number:'1.2-2'}}</td><td>{{r.remaining|number:'1.2-2'}}</td><td>{{r.status}}</td>
<td><button *ngIf="r.status==='DRAFT'" [disabled]="busy" (click)="approve(r)">Valider</button><button *ngIf="r.status==='APPROVED'&&r.remaining>0" [disabled]="busy" (click)="selectPayment(r)">Payer</button></td></tr></tbody></table></div><p *ngIf="!runs.length">Aucune paie calculée pour ce mois.</p></div>
<div class="staff-card" *ngIf="selectedRun"><h3>Versement — {{name(selectedRun.employee_id)}}</h3><p>Reste à payer : {{selectedRun.remaining|number:'1.2-2'}} DA</p>
<div class="form-grid"><label>Montant<input type="number" min="0.01" [max]="selectedRun.remaining" [(ngModel)]="paymentAmount"></label><label>Date<input type="date" [(ngModel)]="paidOn"></label><label>Mode<input [(ngModel)]="method"></label><label>Référence<input [(ngModel)]="reference"></label><label>Note<input [(ngModel)]="paymentNote"></label></div>
<button [disabled]="busy" (click)="pay()">Enregistrer le paiement</button><button class="secondary" (click)="selectedRun=null">Annuler</button></div>
<div class="receipt-overlay" *ngIf="receiptPreviewUrl" role="dialog" aria-modal="true" aria-label="Aperçu du reçu de paiement">
  <div class="receipt-dialog">
    <div class="receipt-toolbar"><strong>Reçu de paiement — aperçu PDF</strong><div><button (click)="printReceipt()">🖨️ Imprimer</button><button class="secondary" (click)="closeReceipt()">Fermer</button></div></div>
    <iframe #receiptFrame [src]="receiptPreviewUrl" title="Aperçu du reçu de paiement"></iframe>
  </div>
</div></section>`,styleUrls:['./staff-payroll.scss']})
export class StaffPayrollComponent implements OnInit, OnDestroy {
 private api=inject(StaffPayrollService); private sanitizer=inject(DomSanitizer); receiptPreviewUrl:SafeResourceUrl|null=null; private receiptObjectUrl:string|null=null;employees:StaffEmployee[]=[];contracts:Contract[]=[];runs:PayRun[]=[];error='';success='';busy=false;
 month=new Date().toLocaleDateString('en-CA').slice(0,7);employeeId=0;payType='MONTHLY';baseRate=0;effectiveFrom=new Date().toLocaleDateString('en-CA');effectiveTo='';bonus=0;deduction=0;note='';
 lastReceipt:PaymentReceipt|null=null;selectedRun:PayRun|null=null;paymentAmount=0;paidOn=new Date().toLocaleDateString('en-CA');method='ESPECES';reference='';paymentNote='';
 ngOnInit(){this.api.employees().subscribe({next:r=>this.employees=r,error:e=>this.error=this.msg(e)});this.loadRuns()}
 name(id:number){const e=this.employees.find(x=>x.id===id);return e?`${e.first_name} ${e.last_name}`:`Employé #${id}`}
 loadRuns(){this.api.runs(this.month+'-01').subscribe({next:r=>this.runs=r,error:e=>this.error=this.msg(e)})}
 loadContracts(){this.contracts=[];if(this.employeeId)this.api.contracts(this.employeeId).subscribe({next:r=>this.contracts=r,error:e=>this.error=this.msg(e)})}
 saveContract(){this.run(()=>this.api.saveContract({employeeId:this.employeeId,payType:this.payType,baseRate:this.baseRate,effectiveFrom:this.effectiveFrom,effectiveTo:this.effectiveTo||null}).subscribe({next:()=>{this.done('Contrat créé.');this.loadContracts()},error:e=>this.fail(e)}))}
 calculate(){this.run(()=>this.api.calculate({employeeId:this.employeeId,month:this.month+'-01',bonus:this.bonus,deduction:this.deduction,note:this.note}).subscribe({next:()=>{this.done('Paie calculée.');this.loadRuns()},error:e=>this.fail(e)}))}
 approve(r:PayRun){if(!confirm('Valider cette paie ? Elle ne pourra plus être recalculée.'))return;this.run(()=>this.api.approve(r.id).subscribe({next:()=>{this.done('Paie validée.');this.loadRuns()},error:e=>this.fail(e)}))}
 selectPayment(r:PayRun){this.selectedRun=r;this.paymentAmount=Number(r.remaining);this.error=''}
 pay(){const r=this.selectedRun;if(!r)return;if(this.paymentAmount<=0||this.paymentAmount>Number(r.remaining)){this.error='Montant invalide.';return}this.run(()=>this.api.pay(r.id,{amount:this.paymentAmount,paidOn:this.paidOn,method:this.method,reference:this.reference,note:this.paymentNote}).subscribe({next:receipt=>{this.lastReceipt=receipt;this.selectedRun=null;this.done('Paiement enregistré.');this.loadRuns();this.openReceipt(receipt.payment_id)},error:e=>this.fail(e)}))}
 openReceipt(id:number){
  this.closeReceipt();
  this.api.receiptPdf(id).subscribe({next:blob=>{
    this.receiptObjectUrl=URL.createObjectURL(new Blob([blob],{type:'application/pdf'}));
    this.receiptPreviewUrl=this.sanitizer.bypassSecurityTrustResourceUrl(this.receiptObjectUrl);
  },error:e=>this.error=this.msg(e)});
 }
 printReceipt(){
  if(!this.receiptObjectUrl)return;
  // The browser PDF viewer provides a native Print action. Trigger it when supported.
  const frame=document.querySelector<HTMLIFrameElement>('.receipt-dialog iframe');
  try{frame?.contentWindow?.focus();frame?.contentWindow?.print()}catch{
    this.error='Utilisez le bouton Imprimer du lecteur PDF dans la fenêtre d’aperçu.';
  }
 }
 closeReceipt(){this.receiptPreviewUrl=null;if(this.receiptObjectUrl){URL.revokeObjectURL(this.receiptObjectUrl);this.receiptObjectUrl=null}}
 ngOnDestroy(){this.closeReceipt()}

 private run(action:()=>void){this.busy=true;this.error='';this.success='';action()}
 private done(s:string){this.busy=false;this.success=s}
 private fail(e:any){this.busy=false;this.error=this.msg(e)}
 private msg(e:any){return e?.error?.detail||e?.error?.message||'Une erreur est survenue.'}
}
