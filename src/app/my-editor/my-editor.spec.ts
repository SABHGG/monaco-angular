import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyEditor } from './my-editor';

describe('MyEditor', () => {
  let component: MyEditor;
  let fixture: ComponentFixture<MyEditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyEditor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyEditor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
