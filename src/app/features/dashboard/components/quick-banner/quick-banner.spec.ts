import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuickBanner } from './quick-banner';

describe('QuickBanner', () => {
  let component: QuickBanner;
  let fixture: ComponentFixture<QuickBanner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuickBanner],
    }).compileComponents();

    fixture = TestBed.createComponent(QuickBanner);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
