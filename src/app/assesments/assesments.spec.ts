import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Assesments } from './assesments';

describe('Assesments', () => {
  let component: Assesments;
  let fixture: ComponentFixture<Assesments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Assesments]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Assesments);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
