import {CommonModule} from '@angular/common'; import {Component,inject,OnInit} from '@angular/core'; import {FormsModule} from '@angular/forms'; import {forkJoin} from 'rxjs';
import {TimetableService} from '../services/timetable.service'; import {EligibleAssignment,ScheduleEntry,ScheduleEntryRequest,SchoolDay} from '../models/timetable.model';
import {SchoolYearService} from '../../school/school-years/services/school-year.service'; import {ClassGroupService} from '../../school/class-groups/services/class-group.service'; import {TimeSlotService} from '../../school/time-slots/services/time-slot.service'; import {RoomService} from '../../school/rooms/services/room.service';
import {SchoolYear} from '../../school/school-years/models/school-year.model'; import {ClassGroup} from '../../school/class-groups/models/class-group.model'; import {TimeSlot} from '../../school/time-slots/models/time-slot.model'; import {Room} from '../../school/rooms/models/room.model';
@Component({selector:'app-timetable',standalone:true,imports:[CommonModule,FormsModule],templateUrl:'./timetable.component.html',styleUrl:'./timetable.component.scss'})
export class TimetableComponent implements OnInit { private api=inject(TimetableService); private ys=inject(SchoolYearService); private cs=inject(ClassGroupService); private ss=inject(TimeSlotService); private rs=inject(RoomService);
years:SchoolYear[]=[]; classes:ClassGroup[]=[]; slots:TimeSlot[]=[]; rooms:Room[]=[]; entries:ScheduleEntry[]=[]; eligible:EligibleAssignment[]=[]; yearId:number|null=null; classId:number|null=null; loading=false; saving=false; error=''; success=''; modal=false; deleteTarget:ScheduleEntry|null=null; editing:ScheduleEntry|null=null;
days:{key:SchoolDay;label:string}[]=[{key:'SUNDAY',label:'Dimanche'},{key:'MONDAY',label:'Lundi'},{key:'TUESDAY',label:'Mardi'},{key:'WEDNESDAY',label:'Mercredi'},{key:'THURSDAY',label:'Jeudi'}];
form:ScheduleEntryRequest={teachingAssignmentId:0,dayOfWeek:'SUNDAY',timeSlotId:0,roomId:null,validFrom:'',validUntil:null};
ngOnInit(){forkJoin({y:this.ys.getAll(),c:this.cs.getAll(),s:this.ss.getAll(),r:this.rs.getAll()}).subscribe({next:x=>{this.years=x.y;this.classes=x.c;this.slots=x.s.filter(v=>v.active).sort((a,b)=>a.displayOrder-b.displayOrder);this.rooms=x.r.filter(v=>v.active);const cur=this.years.find(v=>v.currentYear)||this.years[0];if(cur){this.yearId=cur.id;this.form.validFrom=cur.startDate;}},error:()=>this.error='Impossible de charger les référentiels.'})}
get filteredClasses(){return this.classes.filter(c=>!this.yearId||c.schoolYearId===this.yearId)} get selectedClass(){return this.classes.find(c=>c.id===this.classId)} get selectedYear(){return this.years.find(y=>y.id===this.yearId)} get availableRooms(){const campus=this.selectedClass?.campusId;return this.rooms.filter(r=>!campus||r.campusId===campus)}
onYear(){this.classId=null;this.entries=[];this.eligible=[];const y=this.years.find(v=>v.id===this.yearId);if(y)this.form.validFrom=y.startDate;}
onClass(){this.entries=[];this.eligible=[];if(!this.yearId||!this.classId)return;this.loading=true;this.error='';forkJoin({e:this.api.byClass(this.classId,this.yearId),a:this.api.eligible(this.yearId,this.classId)}).subscribe({next:x=>{this.entries=x.e;this.eligible=x.a;this.loading=false},error:e=>{this.error=this.message(e);this.loading=false}})}
cell(day:SchoolDay,slotId:number){return this.entries.find(e=>e.dayOfWeek===day&&e.timeSlotId===slotId)}
dayLabel(day:SchoolDay){return this.days.find(d=>d.key===day)?.label||day}
async exportPdf(){
  if(!this.classId||!this.yearId)return;
  this.error='';
  try{
    const width=2480, height=3508, half=height/2;
    const canvas=document.createElement('canvas'); canvas.width=width; canvas.height=height;
    const ctx=canvas.getContext('2d'); if(!ctx) throw new Error('Canvas indisponible');
    ctx.fillStyle='#ffffff'; ctx.fillRect(0,0,width,height);
    const logo=await this.loadImage('assets/logo.png').catch(()=>null);
    this.drawPdfCopy(ctx,0,half,logo);
    this.drawPdfCopy(ctx,half,half,logo);
    ctx.save(); ctx.strokeStyle='#94a3b8'; ctx.lineWidth=2; ctx.setLineDash([18,14]); ctx.beginPath(); ctx.moveTo(70,half); ctx.lineTo(width-70,half); ctx.stroke(); ctx.restore();
    const jpg=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Image PDF impossible')),'image/jpeg',0.94));
    const pdf=this.buildOnePagePdf(new Uint8Array(await jpg.arrayBuffer()),width,height);
    const blob=new Blob([pdf],{type:'application/pdf'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob);
    const cls=this.cleanFileName(this.selectedClass?.name||'classe'); const yr=this.cleanFileName(this.selectedYear?.label||'annee');
    a.download=`emploi-du-temps_${cls}_${yr}.pdf`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),1000);
    this.success='PDF généré : 2 emplois du temps sur une seule page A4.'; setTimeout(()=>this.success='',3000);
  }catch(e){ console.error(e); this.error='Impossible de générer le PDF.'; }
}
private loadImage(src:string){return new Promise<HTMLImageElement>((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=src})}
private drawPdfCopy(ctx:CanvasRenderingContext2D,top:number,h:number,logo:HTMLImageElement|null){
  const margin=92, x=margin, w=2480-margin*2, headerH=190, footerH=62;
  ctx.save(); ctx.fillStyle='#fff'; ctx.fillRect(0,top,2480,h);
  if(logo)ctx.drawImage(logo,x,top+36,92,92);
  ctx.fillStyle='#0f2742'; ctx.font='700 36px Arial'; ctx.textBaseline='top'; ctx.fillText('Groupe Scolaire Sciences et Lettres',x+(logo?118:0),top+42);
  ctx.fillStyle='#64748b'; ctx.font='22px Arial'; ctx.fillText('Emploi du temps',x+(logo?118:0),top+92);
  ctx.textAlign='right'; ctx.fillStyle='#0f2742'; ctx.font='700 38px Arial'; ctx.fillText(this.selectedClass?.name||'',x+w,top+38);
  ctx.fillStyle='#475569'; ctx.font='21px Arial'; ctx.fillText(`Année scolaire : ${this.selectedYear?.label||'—'}`,x+w,top+88);
  if(this.selectedClass?.campusName)ctx.fillText(`Campus : ${this.selectedClass.campusName}`,x+w,top+120);
  ctx.textAlign='left';
  const tableY=top+headerH, tableH=h-headerH-footerH-34, rows=this.slots.length+1, rowH=tableH/rows;
  const timeW=285, dayW=(w-timeW)/this.days.length;
  ctx.lineWidth=2; ctx.strokeStyle='#475569';
  ctx.fillStyle='#eaf2fb'; ctx.fillRect(x,tableY,w,rowH);
  for(let r=0;r<=rows;r++){const yy=tableY+r*rowH;ctx.beginPath();ctx.moveTo(x,yy);ctx.lineTo(x+w,yy);ctx.stroke()}
  let xx=x; const colXs=[x,x+timeW]; for(let i=0;i<this.days.length;i++)colXs.push(x+timeW+(i+1)*dayW);
  for(const cx of colXs){ctx.beginPath();ctx.moveTo(cx,tableY);ctx.lineTo(cx,tableY+tableH);ctx.stroke()}
  ctx.fillStyle='#0f2742'; ctx.font='700 21px Arial'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('Créneau',x+timeW/2,tableY+rowH/2);
  this.days.forEach((d,i)=>ctx.fillText(d.label,x+timeW+dayW*i+dayW/2,tableY+rowH/2));
  this.slots.forEach((s,ri)=>{
    const cy=tableY+rowH*(ri+1)+rowH/2;
    ctx.fillStyle='#334155'; ctx.font='700 20px Arial'; ctx.fillText(`${s.startTime.slice(0,5)} — ${s.endTime.slice(0,5)}`,x+timeW/2,cy-8);
    if(s.code){ctx.fillStyle='#94a3b8';ctx.font='16px Arial';ctx.fillText(s.code,x+timeW/2,cy+20)}
    this.days.forEach((d,di)=>{const e=this.cell(d.key,s.id); if(!e)return; const cx=x+timeW+dayW*di+dayW/2; const max=dayW-24;
      ctx.fillStyle='#0f2742'; ctx.font='700 22px Arial'; this.fitText(ctx,e.subjectName,cx,cy-28,max);
      ctx.fillStyle='#475569'; ctx.font='19px Arial'; this.fitText(ctx,e.teacherName,cx,cy+2,max);
      if(e.roomName){ctx.fillStyle='#64748b';ctx.font='17px Arial';this.fitText(ctx,e.roomName,cx,cy+30,max)}
    });
  });
  ctx.textBaseline='alphabetic'; ctx.textAlign='left'; ctx.fillStyle='#64748b'; ctx.font='17px Arial'; ctx.fillText(`${this.selectedClass?.name||''} · ${this.selectedYear?.label||''}`,x,top+h-28);
  ctx.textAlign='right'; ctx.fillText('Groupe Scolaire Sciences et Lettres',x+w,top+h-28);
  ctx.restore();
}
private fitText(ctx:CanvasRenderingContext2D,text:string,cx:number,y:number,max:number){let t=text||'';if(ctx.measureText(t).width>max){while(t.length>3&&ctx.measureText(t+'…').width>max)t=t.slice(0,-1);t+='…'}ctx.fillText(t,cx,y)}
private cleanFileName(v:string){return v.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_-]+/g,'-').replace(/^-+|-+$/g,'')||'emploi-du-temps'}
private buildOnePagePdf(jpeg:Uint8Array,imgW:number,imgH:number){
  const enc=new TextEncoder(), chunks:Uint8Array[]=[]; let offset=0; const offsets:number[]=[0];
  const add=(v:string|Uint8Array)=>{const b=typeof v==='string'?enc.encode(v):v;chunks.push(b);offset+=b.length};
  add('%PDF-1.4\n%PDFGEN\n');
  const obj=(n:number,body:()=>void)=>{offsets[n]=offset;add(`${n} 0 obj\n`);body();add('\nendobj\n')};
  obj(1,()=>add('<< /Type /Catalog /Pages 2 0 R >>'));
  obj(2,()=>add('<< /Type /Pages /Kids [3 0 R] /Count 1 >>'));
  obj(3,()=>add('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>'));
  obj(4,()=>{add(`<< /Type /XObject /Subtype /Image /Width ${imgW} /Height ${imgH} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`);add(jpeg);add('\nendstream')});
  const stream='q\n595.28 0 0 841.89 0 0 cm\n/Im0 Do\nQ\n';
  obj(5,()=>add(`<< /Length ${enc.encode(stream).length} >>\nstream\n${stream}endstream`));
  const xref=offset; add('xref\n0 6\n0000000000 65535 f \n'); for(let i=1;i<=5;i++)add(`${String(offsets[i]).padStart(10,'0')} 00000 n \n`);
  add(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
  const total=chunks.reduce((n,b)=>n+b.length,0), out=new Uint8Array(total); let p=0; for(const b of chunks){out.set(b,p);p+=b.length} return out;
}
slotLabel(id:number){const s=this.slots.find(x=>x.id===id);return s?`${s.startTime.slice(0,5)} — ${s.endTime.slice(0,5)}`:''}
open(day:SchoolDay,slot:TimeSlot){if(!this.classId||!this.yearId)return;const e=this.cell(day,slot.id);this.editing=e||null;const y=this.years.find(v=>v.id===this.yearId);this.form=e?{teachingAssignmentId:e.teachingAssignmentId,dayOfWeek:e.dayOfWeek,timeSlotId:e.timeSlotId,roomId:e.roomId,validFrom:e.validFrom,validUntil:e.validUntil}:{teachingAssignmentId:this.eligible[0]?.teachingAssignmentId||0,dayOfWeek:day,timeSlotId:slot.id,roomId:null,validFrom:y?.startDate||'',validUntil:y?.endDate||null};this.error='';this.modal=true}
close(){this.modal=false;this.editing=null}
save(){if(!this.form.teachingAssignmentId||!this.form.validFrom)return;this.saving=true;this.error='';const req=this.editing?this.api.update(this.editing.id,this.form):this.api.create(this.form);req.subscribe({next:()=>{this.saving=false;this.modal=false;this.success='Cours enregistré.';this.onClass();setTimeout(()=>this.success='',2500)},error:e=>{this.saving=false;this.error=this.message(e)}})}
askDelete(e:ScheduleEntry,event:Event){event.stopPropagation();this.deleteTarget=e}
confirmDelete(){if(!this.deleteTarget)return;this.saving=true;this.api.remove(this.deleteTarget.id).subscribe({next:()=>{this.deleteTarget=null;this.saving=false;this.success='Cours retiré.';this.onClass()},error:e=>{this.saving=false;this.error=this.message(e);this.deleteTarget=null}})}
private message(e:any){return e?.error?.message||e?.error?.detail||e?.error?.error||'Une erreur est survenue.'}
}
