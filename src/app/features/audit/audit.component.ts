import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuditLog, AuditService } from './audit.service';

@Component({
  selector: 'app-audit', standalone: true, imports: [CommonModule, FormsModule],
  templateUrl: './audit.component.html', styleUrl: './audit.component.scss'
})
export class AuditComponent implements OnInit {
  private readonly service = inject(AuditService);
  rows: AuditLog[] = []; loading = false; error = ''; selected: AuditLog | null = null;
  page = 0; size = 50; totalElements = 0; totalPages = 0;
  q = ''; module = ''; action = ''; from = ''; to = '';

  ngOnInit(): void { this.load(); }

  load(page = 0): void {
    this.loading = true; this.error = ''; this.page = page;
    this.service.search({q:this.q,module:this.module,action:this.action,from:this.from,to:this.to,page:this.page,size:this.size}).subscribe({
      next: r => { this.rows=r.content; this.totalElements=r.totalElements; this.totalPages=r.totalPages; this.loading=false; },
      error: () => { this.error="Impossible de charger le journal de traçabilité."; this.loading=false; }
    });
  }
  reset(): void { this.q=''; this.module=''; this.action=''; this.from=''; this.to=''; this.load(0); }
  open(row: AuditLog): void { this.selected=row; }
  close(): void { this.selected=null; }
  userName(x: AuditLog): string {
    const full=[x.userLastName,x.userFirstName].filter(Boolean).join(' ');
    return full || x.username || 'Système';
  }
  initials(x: AuditLog): string {
    const a=(x.userFirstName?.[0] || '')+(x.userLastName?.[0] || ''); return a || 'S';
  }
  moduleLabel(v: string): string { return (v || 'AUTRE').replaceAll('_',' '); }
  actionLabel(v: string): string { return (v || 'ACTION').replaceAll('_',' '); }
  actionClass(v: string): string {
    const s=(v||'').toUpperCase();
    if(s.includes('DELETE')||s.includes('SUPPR')||s.includes('ANNUL')||s.includes('ECHEC')) return 'danger';
    if(s.includes('UPDATE')||s.includes('MODIF')||s.includes('PATCH')) return 'warning';
    if(s.includes('CREATE')||s.includes('CRE')||s.includes('POST')||s.includes('VALID')) return 'success';
    return 'info';
  }
  prettyJson(v: string | null): string {
    if(!v) return '—';
    try { return JSON.stringify(JSON.parse(v), null, 2); } catch { return v; }
  }
  trackById(_: number, x: AuditLog): number { return x.id; }
}
