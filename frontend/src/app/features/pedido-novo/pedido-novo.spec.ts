import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PedidoNovo } from './pedido-novo';

describe('PedidoNovo', () => {
  let component: PedidoNovo;
  let fixture: ComponentFixture<PedidoNovo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PedidoNovo],
    }).compileComponents();

    fixture = TestBed.createComponent(PedidoNovo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
