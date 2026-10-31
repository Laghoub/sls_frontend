import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ExpensesService, Expense, Item } from './expenses.service';
@Component({selector:'app-expenses',standalone:true,imports:[CommonModule,FormsModule],templateUrl:'./expenses.component.html',styleUrls:['./expenses.component.scss']})
export class ExpensesComponent implements OnInit {
 api=inject(ExpensesService); tab:'expenses'|'suppliers'|'categories'|'budgets'|'reports'='expenses';busy=false;error='';notice='';expenses:Expense[]=[];categories:Item[]=[];suppliers:Item[]=[];payments:any[]=[];reports:any[]=[];reportType:'budget'|'categories'|'cashflow'|'salary-cashflow'='categories';
 today=new Date().toISOString().slice(0,10); month=Number(this.today.slice(5,7));year=Number(this.today.slice(0,4));from=this.today.slice(0,8)+'01';to=this.today;status='';categoryId='';selected:Expense|null=null;editing=false;
 form:any={expenseDate:this.today,categoryId:null,supplierId:null,description:'',amount:0}; supplier:any={name:'',phone:'',email:'',address:'',taxIdentifier:'',active:true};category:any={name:'',parentId:null,active:true};budget:any={categoryId:null,year:this.year,month:this.month,amount:0}; payment:any={amount:0,paymentMethod:'CASH',cashSessionId:null};rejectReason='';
 ngOnInit(){this.refresh()}
 msg(e:any){return e?.error?.detail||e?.error?.message||e?.message||'Erreur serveur. Vérifiez les permissions et les API.'}
 run(obs:any,done:(r:any)=>void){this.busy=true;this.error='';this.notice='';obs.subscribe({next:(r:any)=>{this.busy=false;done(r)},error:(e:any)=>{this.busy=false;this.error=this.msg(e)}})}
 refresh(){this.api.categories().subscribe({next:r=>this.categories=r,error:e=>this.error=this.msg(e)});this.api.suppliers().subscribe({next:r=>this.suppliers=r,error:e=>this.error=this.msg(e)});this.load()}
 load(){const f:Record<string,string>={from:this.from,to:this.to,status:this.status,categoryId:this.categoryId};this.run(this.api.list(f),r=>this.expenses=r)}
 newExpense(){this.editing=true;this.selected=null;this.form={expenseDate:this.today,categoryId:null,supplierId:null,description:'',amount:0}}
 edit(e:Expense){if(e.status!=='DRAFT')return;this.selected=e;this.editing=true;this.form={expenseDate:e.expense_date,categoryId:e.expense_category_id,supplierId:e.provider_id,description:e.description,amount:e.amount}}
 save(){if(!this.form.categoryId||!this.form.description||Number(this.form.amount)<=0){this.error='Catégorie, description et montant positif requis.';return}const obs=this.selected?this.api.update(this.selected.id,this.form):this.api.create(this.form);this.run(obs,()=>{this.editing=false;this.notice='Dépense enregistrée.';this.load()})}
 action(e:Expense,a:'submit'|'approve'|'reject'){if(a==='reject'&&!this.rejectReason.trim()){this.error='Motif du rejet requis.';return}if(!confirm('Confirmer cette opération ?'))return;this.run(this.api.action(e.id,a,a==='reject'?{reason:this.rejectReason}:{}),()=>{this.notice='Statut mis à jour.';this.load()})}
 select(e:Expense){this.selected=e;this.editing=false;this.payment={amount:Math.max(0,Number(e.amount)-Number(e.paid_amount||0)),paymentMethod:'CASH',cashSessionId:null};this.api.payments(e.id).subscribe({next:r=>this.payments=r,error:err=>this.error=this.msg(err)})}
 pay(){if(!this.selected)return;const rest=Number(this.selected.amount)-Number(this.selected.paid_amount||0);if(Number(this.payment.amount)<=0||Number(this.payment.amount)>rest){this.error='Montant supérieur au reste à payer.';return}if(this.payment.paymentMethod==='CASH'&&!this.payment.cashSessionId){this.error='Indiquez l’identifiant de la session de caisse ouverte.';return}if(!confirm('Enregistrer ce décaissement ?'))return;this.run(this.api.pay(this.selected.id,this.payment),()=>{this.notice='Paiement enregistré en caisse selon le mode choisi.';this.load();this.api.payments(this.selected!.id).subscribe(r=>this.payments=r)})}
 addSupplier(){this.run(this.api.addSupplier(this.supplier),()=>{this.notice='Fournisseur ajouté.';this.supplier={name:'',phone:'',email:'',address:'',taxIdentifier:'',active:true};this.api.suppliers().subscribe(r=>this.suppliers=r)})}
 addCategory(){this.run(this.api.addCategory(this.category),()=>{this.notice='Catégorie ajoutée.';this.category={name:'',parentId:null,active:true};this.api.categories().subscribe(r=>this.categories=r)})}
 saveBudget(){this.run(this.api.budget(this.budget),()=>{this.notice='Budget enregistré.';this.loadReport()})}
 loadReport(){const params=this.reportType==='budget'?{year:this.year,month:this.month}:{from:this.from,to:this.to};this.run(this.api.report(this.reportType,params),r=>this.reports=r)}
 keys(){return this.reports.length?Object.keys(this.reports[0]):[]}
 amount(v:any){return Number(v||0).toLocaleString('fr-DZ',{minimumFractionDigits:2,maximumFractionDigits:2})}
}
