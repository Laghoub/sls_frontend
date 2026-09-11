import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/config/auth/services/auth.service';
import { CampusRef } from '../../models/finance-reference.model';
import {
  CashMovement,
  CashMovementRequest,
  CashRegister,
  CashRegisterRequest,
  CashRegisterSession,
} from '../../models/finance.model';
import { CashMovementService } from '../../services/cash-movement.service';
import { CashRegisterService } from '../../services/cash-register.service';
import { FinanceReferenceService } from '../../services/finance-reference.service';
import { FinanceSessionStateService } from '../../services/finance-session-state.service';

@Component({selector:'app-cash',standalone:true,imports:[CommonModule,FormsModule],templateUrl:'./cash.component.html',styleUrl:'./cash.component.scss'})
export class CashComponent {
  private s=inject(CashRegisterService); private moves=inject(CashMovementService); private refs=inject(FinanceReferenceService); private state=inject(FinanceSessionStateService);
  auth=inject(AuthService);
  registers=signal<CashRegister[]>([]); campuses=signal<CampusRef[]>([]); session=this.state.current; movements=signal<CashMovement[]>([]); history=signal<CashRegisterSession[]>([]);
  historyTotal=signal(0); historyPage=signal(0); historyPages=signal(0); historyRegisterId:number|null=null;
  error=signal(''); registerModal=signal(false); movementModal=signal(false); closeModal=signal(false); editing=signal<CashRegister|null>(null);
  registerForm:CashRegisterRequest={code:'',name:'',campusId:null,active:true}; openRegisterId:number|null=null; openingBalance=0; actualClosingBalance=0;
  movementForm:CashMovementRequest={cashRegisterSessionId:0,movementType:'ADJUSTMENT',direction:'IN',amount:0,reference:null,description:null};

  constructor(){
    this.loadRegisters();
    this.refs.campuses().subscribe({next:x=>this.campuses.set(x),error:e=>this.error.set(this.msg(e))});
    this.restoreCurrentSession();
  }

  restoreCurrentSession(){
    this.s.currentSession().subscribe({next:x=>{if(x){this.state.set(x);this.openRegisterId=x.cashRegisterId;this.loadMovements();}else{this.state.clear();this.movements.set([]);}},error:e=>this.error.set(this.msg(e))});
  }

  loadRegisters(){this.s.all().subscribe({next:x=>{this.registers.set(x);if(!this.openRegisterId)this.openRegisterId=x.find(c=>c.active)?.id??null;if(!this.historyRegisterId)this.historyRegisterId=x[0]?.id??null;this.loadHistory();},error:e=>this.error.set(this.msg(e))});}
  openCreate(){this.editing.set(null);this.registerForm={code:'',name:'',campusId:null,active:true};this.registerModal.set(true);}
  openEdit(x:CashRegister){this.editing.set(x);this.registerForm={code:x.code,name:x.name,campusId:x.campusId,active:x.active};this.registerModal.set(true);}
  saveRegister(){const op=this.editing()?this.s.update(this.editing()!.id,this.registerForm):this.s.create(this.registerForm);op.subscribe({next:()=>{this.registerModal.set(false);this.loadRegisters();},error:e=>this.error.set(this.msg(e))});}
  openSession(){if(!this.openRegisterId)return;this.s.openSession({cashRegisterId:this.openRegisterId,openingBalance:Number(this.openingBalance)}).subscribe({next:x=>{this.state.set(x);this.movements.set([]);this.loadMovements();this.loadHistory();},error:e=>this.error.set(this.msg(e))});}
  loadMovements(){const s=this.session();if(!s){this.movements.set([]);return;}this.moves.search(s.id,0,100).subscribe({next:r=>this.movements.set(r.content??[]),error:e=>this.error.set(this.msg(e))});}
  openMovement(){const s=this.session();if(!s)return;this.movementForm={cashRegisterSessionId:s.id,movementType:'ADJUSTMENT',direction:'IN',amount:0,reference:null,description:null};this.movementModal.set(true);}
  saveMovement(){this.moves.create(this.movementForm).subscribe({next:()=>{this.movementModal.set(false);this.loadMovements();},error:e=>this.error.set(this.msg(e))});}
  close(){const s=this.session();if(!s)return;this.s.closeSession(s.id,{actualClosingBalance:Number(this.actualClosingBalance)}).subscribe({next:x=>{this.closeModal.set(false);this.state.set(x);this.loadMovements();this.loadHistory();},error:e=>this.error.set(this.msg(e))});}

  loadHistory(){if(!this.historyRegisterId)return;this.s.history(this.historyRegisterId,this.historyPage(),20).subscribe({next:r=>{this.history.set(r.content);this.historyTotal.set(r.totalElements);this.historyPages.set(r.totalPages);},error:e=>this.error.set(this.msg(e))});}
  selectHistoryRegister(){this.historyPage.set(0);this.loadHistory();}
  historyPrev(){if(this.historyPage()>0){this.historyPage.update(v=>v-1);this.loadHistory();}}
  historyNext(){if(this.historyPage()+1<this.historyPages()){this.historyPage.update(v=>v+1);this.loadHistory();}}
  registerName(id:number){return this.registers().find(x=>x.id===id)?.name??`Caisse #${id}`;}
  campus(id:number|null){return id?(this.campuses().find(x=>x.id===id)?.name??'Campus'):'—';}
  msg(e:any){return e?.error?.message??'Une erreur est survenue.';}
}
