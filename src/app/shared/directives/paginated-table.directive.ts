import { AfterViewChecked, Directive, ElementRef, OnDestroy, Renderer2 } from '@angular/core';

/** Pagination locale des lignes déjà présentes dans un tableau.
 * Les filtres/recherches Angular restent appliqués avant cette pagination.
 * Pour de très grands volumes, préférer une API paginée côté serveur.
 */
@Directive({ selector: 'table[appPaginatedTable]', standalone: true })
export class PaginatedTableDirective implements AfterViewChecked, OnDestroy {
  private page = 0;
  private size = 15;
  private toolbar: HTMLElement | null = null;
  private select: HTMLSelectElement | null = null;
  private info: HTMLElement | null = null;
  private first: HTMLButtonElement | null = null;
  private previous: HTMLButtonElement | null = null;
  private next: HTMLButtonElement | null = null;
  private last: HTMLButtonElement | null = null;
  private lastSignature = '';
  private lastRows: HTMLTableRowElement[] = [];
  private cleanup: Array<() => void> = [];

  constructor(private host: ElementRef<HTMLTableElement>, private renderer: Renderer2) {}

  ngAfterViewChecked(): void {
    const table = this.host.nativeElement;
    const rows = Array.from(table.tBodies).flatMap(body => Array.from(body.rows));
    // Une modification de filtres peut remplacer les lignes sans changer leur nombre.
    const changed = rows.length !== this.lastRows.length || rows.some((r, i) => r !== this.lastRows[i]);
    if (changed) {
      this.page = 0;
      this.lastRows = rows;
    }
    const pages = Math.max(1, Math.ceil(rows.length / this.size));
    this.page = Math.min(this.page, pages - 1);
    const signature = `${rows.length}:${this.page}:${this.size}:${changed}`;
    if (signature === this.lastSignature && !changed) return;
    this.lastSignature = signature;
    rows.forEach((row, index) => {
      const visible = index >= this.page * this.size && index < (this.page + 1) * this.size;
      this.renderer.setStyle(row, 'display', visible ? '' : 'none');
    });
    if (rows.length <= 15 && this.size === 15) {
      if (this.toolbar) this.renderer.setStyle(this.toolbar, 'display', 'none');
      return;
    }
    this.ensureToolbar();
    if (!this.toolbar || !this.info) return;
    this.renderer.setStyle(this.toolbar, 'display', 'flex');
    this.info.textContent = `${rows.length ? this.page * this.size + 1 : 0}–${Math.min(rows.length, (this.page + 1) * this.size)} sur ${rows.length}`;
    if (this.select) this.select.value = String(this.size);
    if (this.first) this.first.disabled = this.page === 0;
    if (this.previous) this.previous.disabled = this.page === 0;
    if (this.next) this.next.disabled = this.page >= pages - 1;
    if (this.last) this.last.disabled = this.page >= pages - 1;
  }

  private ensureToolbar(): void {
    if (this.toolbar) return;
    const table = this.host.nativeElement;
    const container = this.renderer.createElement('div') as HTMLElement;
    this.renderer.addClass(container, 'app-table-pagination');
    container.setAttribute('role', 'navigation');
    container.setAttribute('aria-label', 'Pagination du tableau');
    const sizeLabel = this.renderer.createElement('label') as HTMLLabelElement;
    sizeLabel.textContent = 'Lignes par page : ';
    const select = this.renderer.createElement('select') as HTMLSelectElement;
    select.setAttribute('aria-label', 'Nombre de lignes par page');
    for (const n of [15, 30, 50, 100]) {
      const option = this.renderer.createElement('option') as HTMLOptionElement;
      option.value = String(n); option.textContent = String(n);
      this.renderer.appendChild(select, option);
    }
    select.value = String(this.size);
    this.cleanup.push(this.renderer.listen(select, 'change', () => {
      this.size = Number(select.value) || 15; this.page = 0; this.refresh();
    }));
    this.renderer.appendChild(sizeLabel, select);
    this.renderer.appendChild(container, sizeLabel);
    const info = this.renderer.createElement('span') as HTMLElement;
    info.setAttribute('aria-live', 'polite');
    this.renderer.appendChild(container, info);
    const controls = this.renderer.createElement('div') as HTMLElement;
    this.renderer.addClass(controls, 'app-table-pagination-buttons');
    const button = (label: string, action: () => void): HTMLButtonElement => {
      const b = this.renderer.createElement('button') as HTMLButtonElement;
      b.type = 'button'; b.textContent = label; b.setAttribute('aria-label', label);
      this.cleanup.push(this.renderer.listen(b, 'click', action));
      this.renderer.appendChild(controls, b); return b;
    };
    this.first = button('«', () => { this.page = 0; this.refresh(); });
    this.previous = button('‹', () => { this.page = Math.max(0, this.page - 1); this.refresh(); });
    this.next = button('›', () => { this.page++; this.refresh(); });
    this.last = button('»', () => {
      const count = Array.from(table.tBodies).reduce((n, body) => n + body.rows.length, 0);
      this.page = Math.max(0, Math.ceil(count / this.size) - 1); this.refresh();
    });
    this.renderer.appendChild(container, controls);
    // Insérer après le conteneur de défilement, pas à l'intérieur de <table>.
    const wrapper = table.parentElement;
    const anchor = wrapper && wrapper !== table && (wrapper.classList.contains('table-wrap') || wrapper.classList.contains('table-responsive') || wrapper.classList.contains('table-container')) ? wrapper : table;
    this.renderer.insertBefore(anchor.parentNode, container, anchor.nextSibling);
    this.toolbar = container; this.select = select; this.info = info;
  }

  private refresh(): void { this.lastSignature = ''; this.ngAfterViewChecked(); }
  ngOnDestroy(): void {
    this.cleanup.forEach(fn => fn());
    if (this.toolbar?.parentNode) this.renderer.removeChild(this.toolbar.parentNode, this.toolbar);
    this.lastRows.forEach(row => this.renderer.removeStyle(row, 'display'));
  }
}
