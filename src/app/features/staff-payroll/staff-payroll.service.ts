import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_CONFIG } from '../../core/api.config';
export interface StaffEmployee { id:number; employee_number:string; position_title:string; first_name:string; last_name:string; }
export interface PaymentReceipt { payment_id:number; receipt_number:string; amount:number; paid_on:string; paid_total:number; remaining:number; }
export interface Contract { id:number; employee_id:number; pay_type:string; base_rate:number; effective_from:string; effective_to:string|null; }
export interface Attendance { employee_id:number; work_date:string; status:string; check_in:string|null; check_out:string|null; worked_minutes:number|null; paid:boolean; note:string|null; }
export interface PayRun { id:number; employee_id:number; pay_month:string; status:string; base_amount:number; bonus_amount:number; deduction_amount:number; net_amount:number; paid_amount:number; remaining:number; }
@Injectable({providedIn:'root'})
export class StaffPayrollService {
 private http=inject(HttpClient); private root=`${API_CONFIG.baseUrl}/staff-payroll`;
 employees(){return this.http.get<StaffEmployee[]>(`${this.root}/employees`)}
 receiptPdf(paymentId:number){return this.http.get(`${this.root}/payments/${paymentId}/receipt.pdf`,{responseType:'blob'})}
 contracts(employeeId:number){return this.http.get<Contract[]>(`${this.root}/contracts`,{params:{employeeId}})}
 saveContract(body:{employeeId:number;payType:string;baseRate:number;effectiveFrom:string;effectiveTo:string|null}){return this.http.post<Contract>(`${this.root}/contracts`,body)}
 attendance(from:string,to:string){return this.http.get<Attendance[]>(`${this.root}/attendance`,{params:{from,to}})}
 mark(body:{employeeId:number;workDate:string;status:string;checkIn:string|null;checkOut:string|null;workedMinutes:number|null;paid:boolean;note:string|null}){return this.http.put<Attendance>(`${this.root}/attendance`,body)}
 runs(month:string){return this.http.get<PayRun[]>(`${this.root}/runs`,{params:{month}})}
 calculate(body:{employeeId:number;month:string;bonus:number;deduction:number;note:string}){return this.http.post<PayRun>(`${this.root}/runs/calculate`,body)}
 approve(id:number){return this.http.post<PayRun>(`${this.root}/runs/${id}/approve`,{})}
 pay(id:number,body:{amount:number;paidOn:string;method:string;reference:string;note:string}){return this.http.post<PaymentReceipt>(`${this.root}/runs/${id}/payments`,body)}
}
