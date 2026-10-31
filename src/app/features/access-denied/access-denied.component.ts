import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/config/auth/services/auth.service';
@Component({ standalone: true, selector: 'app-access-denied', imports: [RouterLink], template: `
<section class="denied"><div class="card"><div class="icon">&#9888;</div><h2>Accès non autorisé</h2>
<p>Vous ne disposez pas des permissions nécessaires pour accéder à cette page.</p>
<a class="btn" [routerLink]="auth.homeRoute()">Retour à mon espace</a></div></section>`,
styles: [`.denied{display:flex;align-items:center;justify-content:center;min-height:65vh;padding:2rem}.card{background:#fff;border:1px solid #e5eaf2;border-radius:16px;box-shadow:0 8px 28px #142e5412;padding:3rem;text-align:center;max-width:520px}.icon{font-size:2rem;color:#b98223}h2{color:#173454}p{color:#52637b;line-height:1.6}.btn{display:inline-block;background:#193e70;color:white;text-decoration:none;border-radius:9px;padding:.7rem 1.2rem;margin-top:1rem}`] })
export class AccessDeniedComponent { readonly auth = inject(AuthService); }
