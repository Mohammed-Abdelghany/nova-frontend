import { NgTemplateOutlet } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { Page } from '../../../../core/models/page.model';
import { Product, ProductFilters } from '../../../../core/models/product.model';
import { ProductService } from '../../../../core/services/product.service';
import { Pagination } from '../../../../shared/pagination/pagination';
import { ProductCard } from '../product-card/product-card';

const PAGE_SIZE = 9;

type AvailabilityFilter = 'all' | 'available';

interface SortOption {
  value: string;
  label: string;
}

const SORT_OPTIONS: SortOption[] = [
  { value: 'createdAt,desc', label: 'الأحدث' },
  { value: 'price,asc', label: 'السعر: من الأقل للأعلى' },
  { value: 'price,desc', label: 'السعر: من الأعلى للأقل' },
  { value: 'title,asc', label: 'الاسم (أ-ي)' }
];

const EMPTY_PAGE: Page<Product> = { content: [], page: 0, size: PAGE_SIZE, totalElements: 0, totalPages: 0, last: true };

@Component({
  selector: 'app-product-showcase',
  imports: [ProductCard, Pagination, ReactiveFormsModule, FormsModule, NgTemplateOutlet],
  templateUrl: './product-showcase.html'
})
export class ProductShowcase {
  private readonly productService = inject(ProductService);

  protected readonly result = signal<Page<Product>>(EMPTY_PAGE);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly categories = signal<string[]>([]);
  protected readonly mobileFiltersOpen = signal(false);

  protected readonly searchControl = new FormControl('', { nonNullable: true });
  protected readonly selectedCategory = signal<string | null>(null);
  protected readonly minPrice = signal<number | null>(null);
  protected readonly maxPrice = signal<number | null>(null);
  protected readonly availability = signal<AvailabilityFilter>('all');
  protected readonly sortOptions = SORT_OPTIONS;
  protected readonly sort = signal(SORT_OPTIONS[0].value);

  private searchDebounce?: ReturnType<typeof setTimeout>;

  constructor() {
    this.productService.getCategories().subscribe((categories) => this.categories.set(categories));
    this.load(0);
  }

  onSearchInput(): void {
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => this.load(0), 400);
  }

  selectCategory(category: string | null): void {
    this.selectedCategory.set(this.selectedCategory() === category ? null : category);
    this.load(0);
  }

  setAvailability(value: AvailabilityFilter): void {
    this.availability.set(value);
    this.load(0);
  }

  applyPriceFilter(): void {
    this.load(0);
  }

  onSortChange(value: string): void {
    this.sort.set(value);
    this.load(0);
  }

  hasActiveFilters(): boolean {
    return (
      !!this.searchControl.value.trim() ||
      !!this.selectedCategory() ||
      this.minPrice() != null ||
      this.maxPrice() != null ||
      this.availability() !== 'all'
    );
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.selectedCategory.set(null);
    this.minPrice.set(null);
    this.maxPrice.set(null);
    this.availability.set('all');
    this.load(0);
  }

  toggleMobileFilters(): void {
    this.mobileFiltersOpen.update((open) => !open);
  }

  load(page: number): void {
    this.loading.set(true);
    this.error.set(null);

    const filters: ProductFilters = {
      search: this.searchControl.value.trim() || undefined,
      category: this.selectedCategory() ?? undefined,
      minPrice: this.minPrice() ?? undefined,
      maxPrice: this.maxPrice() ?? undefined,
      available: this.availability() === 'available' ? true : undefined
    };

    this.productService.getPage(page, PAGE_SIZE, filters, this.sort()).subscribe({
      next: (result) => {
        this.loading.set(false);
        this.result.set(result);
        document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      },
      error: () => {
        this.loading.set(false);
        this.error.set('تعذر تحميل المنتجات، حاولي مرة أخرى لاحقًا');
      }
    });
  }
}
