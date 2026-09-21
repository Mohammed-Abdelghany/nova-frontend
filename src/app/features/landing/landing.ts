import { Component } from '@angular/core';

import { Contact } from './components/contact/contact';
import { Footer } from './components/footer/footer';
import { Header } from './components/header/header';
import { Hero } from './components/hero/hero';
import { ProductShowcase } from './components/product-showcase/product-showcase';

@Component({
  selector: 'app-landing',
  imports: [Header, Hero, ProductShowcase, Contact, Footer],
  templateUrl: './landing.html'
})
export class Landing {}
