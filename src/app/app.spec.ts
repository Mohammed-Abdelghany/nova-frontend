import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { App } from './app';

describe('App', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  const emptyPage = { content: [], page: 0, size: 6, totalElements: 0, totalPages: 0, last: true };

  it('should create the app', async () => {
    const fixture = TestBed.createComponent(App);
    httpMock.expectOne((req) => req.url === '/api/v1/products').flush(emptyPage);
    await fixture.whenStable();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the brand name', async () => {
    const fixture = TestBed.createComponent(App);
    httpMock.expectOne((req) => req.url === '/api/v1/products').flush(emptyPage);
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('header')?.textContent).toContain('Nova');
  });
});
