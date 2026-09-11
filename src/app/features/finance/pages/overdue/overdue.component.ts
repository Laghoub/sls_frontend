import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OverdueCharge } from '../../models/finance-tracking.model';
import { FinanceTrackingService } from '../../services/finance-tracking.service';

@Component({selector:'app-overdue',standalone:true,imports:[CommonModule,FormsModule],templateUrl:'./overdue.component.html',styleUrl:'./overdue.component.scss'})
export class OverdueComponent {
  private tracking=inject(FinanceTrackingService);
  items=signal<OverdueCharge[]>([]); page=signal(0); size=signal(20); total=signal(0); pages=signal(0); error=signal('');
  constructor(){this.load();}
  load(){this.tracking.overdue(this.page(),this.size()).subscribe({next:r=>{this.items.set(r.content);this.total.set(r.totalElements);this.pages.set(r.totalPages);},error:e=>this.error.set(this.msg(e))});}
  prev(){if(this.page()>0){this.page.update(v=>v-1);this.load();}}
  next(){if(this.page()+1<this.pages()){this.page.update(v=>v+1);this.load();}}
  msg(e:any){return e?.error?.message??'Une erreur est survenue.';}
}
