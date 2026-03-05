# Masks, Pipes & Validators — Referência Completa

## 1. Configuração do ngx-mask

```typescript
// app.config.ts
import { provideNgxMask } from 'ngx-mask';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideAnimations(),
    provideNgxMask(),  // ← Global
  ]
};
```

---

## 2. Diretiva de Máscara Inteligente

Detecta CPF (11 dígitos) vs CNPJ (14 dígitos) automaticamente:

```typescript
// shared/directives/cpf-cnpj-mask.directive.ts
@Directive({
  selector: '[appCpfCnpjMask]',
  standalone: true,
  hostDirectives: [{ directive: NgxMaskDirective, inputs: ['mask'] }],
})
export class CpfCnpjMaskDirective implements OnInit {
  private readonly maskDir = inject(NgxMaskDirective);
  private readonly el = inject(ElementRef<HTMLInputElement>);

  ngOnInit() {
    fromEvent(this.el.nativeElement, 'input')
      .pipe(
        debounceTime(0),
        map(() => this.el.nativeElement.value.replace(/\D/g, '').length)
      )
      .subscribe(len => {
        this.maskDir.mask = len <= 11 ? '000.000.000-00' : '00.000.000/0000-00';
      });

    this.maskDir.mask = '000.000.000-00'; // Default CPF
  }
}
```

**Uso no template:**
```html
<input matInput appCpfCnpjMask formControlName="cpfCnpj" placeholder="CPF ou CNPJ" />
```

---

## 3. Máscara de CEP com Autocomplete ViaCEP

```typescript
// shared/directives/cep-mask.directive.ts
@Directive({
  selector: '[appCepMask]',
  standalone: true,
})
export class CepMaskDirective {
  private readonly el = inject(ElementRef<HTMLInputElement>);
  private readonly http = inject(HttpClient);
  private readonly cepFilled = new Subject<string>();

  @Output() cepResolved = new EventEmitter<CepData>();
  @Output() cepLoading  = new EventEmitter<boolean>();

  constructor() {
    fromEvent(this.el.nativeElement, 'input').pipe(
      map(() => this.el.nativeElement.value.replace(/\D/g, '')),
      filter(cep => cep.length === 8),
      distinctUntilChanged(),
      tap(() => this.cepLoading.emit(true)),
      switchMap(cep =>
        this.http.get<any>(`https://viacep.com.br/ws/${cep}/json/`).pipe(
          catchError(() => of(null)),
          finalize(() => this.cepLoading.emit(false))
        )
      ),
      filter(data => data && !data.erro)
    ).subscribe(data => {
      this.cepResolved.emit({
        logradouro: data.logradouro,
        bairro: data.bairro,
        cidade: data.localidade,
        uf: data.uf,
        codigoMunicipio: data.ibge,
      });
    });

    // Formata máscara no input
    fromEvent(this.el.nativeElement, 'input').subscribe(() => {
      const raw = this.el.nativeElement.value.replace(/\D/g, '').slice(0, 8);
      if (raw.length > 5) {
        this.el.nativeElement.value = raw.slice(0, 5) + '-' + raw.slice(5);
      } else {
        this.el.nativeElement.value = raw;
      }
    });
  }
}

export interface CepData {
  logradouro: string;
  bairro: string;
  cidade: string;
  uf: string;
  codigoMunicipio: string;
}
```

**Uso no template:**
```html
<input matInput appCepMask formControlName="cep"
       (cepResolved)="preencherEndereco($event)"
       (cepLoading)="loadingCep.set($event)"
       placeholder="00000-000" maxlength="9" />
```

---

## 4. Pipes de Formatação

### 4.1 CPF/CNPJ Pipe

```typescript
// shared/pipes/cpf-cnpj.pipe.ts
@Pipe({ name: 'cpfCnpj', standalone: true, pure: true })
export class CpfCnpjPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '—';
    const digits = value.replace(/\D/g, '');
    if (digits.length === 11) {
      return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    if (digits.length === 14) {
      return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return value;
  }
}
```

### 4.2 Moeda BRL Pipe

```typescript
// shared/pipes/currency-br.pipe.ts
@Pipe({ name: 'currencyBr', standalone: true, pure: true })
export class CurrencyBrPipe implements PipeTransform {
  private readonly formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });

  transform(value: number | string | null | undefined, showSymbol = true): string {
    if (value === null || value === undefined || value === '') return '—';
    const num = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
    if (isNaN(num)) return '—';
    const formatted = this.formatter.format(num);
    return showSymbol ? formatted : formatted.replace('R$\u00a0', '');
  }
}
```

### 4.3 CEP Pipe

```typescript
// shared/pipes/cep.pipe.ts
@Pipe({ name: 'cep', standalone: true, pure: true })
export class CepPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '—';
    const d = value.replace(/\D/g, '');
    return d.length === 8 ? d.replace(/(\d{5})(\d{3})/, '$1-$2') : value;
  }
}
```

### 4.4 Telefone Pipe

```typescript
// shared/pipes/telefone.pipe.ts
@Pipe({ name: 'telefone', standalone: true, pure: true })
export class TelefonePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '—';
    const d = value.replace(/\D/g, '');
    if (d.length === 11) return d.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    if (d.length === 10) return d.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    return value;
  }
}
```

### 4.5 Status Label & Color Pipe

```typescript
// shared/pipes/status-label.pipe.ts
const STATUS_CONFIG: Record<string, { label: string; color: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
  // Documentos fiscais
  AUTORIZADO:   { label: 'Autorizado',   color: 'success' },
  PENDENTE:     { label: 'Pendente',     color: 'warning' },
  PROCESSANDO:  { label: 'Processando',  color: 'info'    },
  REJEITADO:    { label: 'Rejeitado',    color: 'danger'  },
  CANCELADO:    { label: 'Cancelado',    color: 'neutral' },
  // Vendas
  ABERTA:       { label: 'Aberta',       color: 'info'    },
  FECHADA:      { label: 'Fechada',      color: 'success' },
  ORCAMENTO:    { label: 'Orçamento',    color: 'warning' },
  // OS
  EM_ANDAMENTO: { label: 'Em Andamento', color: 'info'    },
  CONCLUIDA:    { label: 'Concluída',    color: 'success' },
  FATURADA:     { label: 'Faturada',     color: 'success' },
  AGUARDANDO_PECA: { label: 'Aguardando Peça', color: 'warning' },
  // Estoque
  ATIVO:        { label: 'Ativo',        color: 'success' },
  INATIVO:      { label: 'Inativo',      color: 'neutral' },
};

@Pipe({ name: 'statusLabel', standalone: true, pure: true })
export class StatusLabelPipe implements PipeTransform {
  transform(value: string, field: 'label' | 'color' = 'label'): string {
    return STATUS_CONFIG[value]?.[field] ?? value;
  }
}
```

### 4.6 Status Badge Component

```typescript
// shared/components/status-badge/status-badge.component.ts
@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [StatusLabelPipe],
  template: `
    <span class="status-badge" [attr.data-color]="status | statusLabel:'color'">
      <span class="dot"></span>
      {{ status | statusLabel:'label' }}
    </span>
  `,
  styles: [`
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 2px 10px;
      border-radius: var(--radius-full);
      font-size: var(--text-xs);
      font-weight: var(--font-semibold);
      letter-spacing: 0.025em;
      text-transform: uppercase;
      white-space: nowrap;

      .dot {
        width: 6px; height: 6px;
        border-radius: 50%;
      }

      &[data-color="success"] { background: var(--color-success-50); color: var(--color-success-700); .dot { background: var(--color-success-500); } }
      &[data-color="warning"] { background: var(--color-warning-50); color: var(--color-warning-700); .dot { background: var(--color-warning-500); } }
      &[data-color="danger"]  { background: var(--color-danger-50);  color: var(--color-danger-700);  .dot { background: var(--color-danger-500); } }
      &[data-color="info"]    { background: var(--color-info-50);    color: var(--color-info-500);    .dot { background: var(--color-info-500); } }
      &[data-color="neutral"] { background: var(--color-neutral-100); color: var(--color-neutral-600); .dot { background: var(--color-neutral-400); } }
    }
  `]
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: string;
}
```

---

## 5. Validators Reativos

### 5.1 Validador de CPF

```typescript
// shared/validators/cpf.validator.ts
export function cpfValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value?.replace(/\D/g, '');
    if (!value || value.length === 0) return null; // deixa required tratar
    if (value.length !== 11 || /^(\d)\1+$/.test(value)) {
      return { cpfInvalido: true };
    }
    const calc = (mod: number) => {
      const sum = Array.from({ length: mod - 1 }, (_, i) =>
        parseInt(value[i]) * (mod - i)).reduce((a, b) => a + b, 0);
      const rem = (sum * 10) % 11;
      return rem === 10 || rem === 11 ? 0 : rem;
    };
    const valid = calc(10) === parseInt(value[9]) && calc(11) === parseInt(value[10]);
    return valid ? null : { cpfInvalido: true };
  };
}
```

### 5.2 Validador de CNPJ

```typescript
// shared/validators/cnpj.validator.ts
export function cnpjValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value?.replace(/\D/g, '');
    if (!value || value.length === 0) return null;
    if (value.length !== 14 || /^(\d)\1+$/.test(value)) {
      return { cnpjInvalido: true };
    }
    const calc = (weights: number[]) => {
      const sum = weights.reduce((acc, w, i) => acc + parseInt(value[i]) * w, 0);
      const rem = sum % 11;
      return rem < 2 ? 0 : 11 - rem;
    };
    const v1 = calc([5,4,3,2,9,8,7,6,5,4,3,2]);
    const v2 = calc([6,5,4,3,2,9,8,7,6,5,4,3,2]);
    const valid = v1 === parseInt(value[12]) && v2 === parseInt(value[13]);
    return valid ? null : { cnpjInvalido: true };
  };
}
```

### 5.3 Validador Dinâmico CPF ou CNPJ

```typescript
// shared/validators/cpf-cnpj.validator.ts
export function cpfCnpjValidator(): ValidatorFn {
  const cpf  = cpfValidator();
  const cnpj = cnpjValidator();

  return (control: AbstractControl): ValidationErrors | null => {
    const digits = control.value?.replace(/\D/g, '') ?? '';
    if (digits.length <= 11) return cpf(control);
    return cnpj(control);
  };
}
```

### 5.4 Mensagens de Erro Centralizadas

```typescript
// shared/validators/validation-messages.ts
export const VALIDATION_MESSAGES: Record<string, (err?: any) => string> = {
  required:      ()    => 'Campo obrigatório',
  email:         ()    => 'E-mail inválido',
  minlength:     (e)   => `Mínimo ${e.requiredLength} caracteres`,
  maxlength:     (e)   => `Máximo ${e.requiredLength} caracteres`,
  min:           (e)   => `Valor mínimo: ${e.min}`,
  max:           (e)   => `Valor máximo: ${e.max}`,
  cpfInvalido:   ()    => 'CPF inválido',
  cnpjInvalido:  ()    => 'CNPJ inválido',
  pattern:       ()    => 'Formato inválido',
};

// Helper para pegar a primeira mensagem de erro de um control
export function getFirstError(control: AbstractControl | null): string {
  if (!control?.errors) return '';
  const [key, value] = Object.entries(control.errors)[0];
  return VALIDATION_MESSAGES[key]?.(value) ?? key;
}
```

### 5.5 Form Field Component (wrapper com erro automático)

```typescript
@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatHintModule, MatErrorModule],
  template: `
    <mat-form-field [appearance]="appearance" [class]="fieldClass">
      <mat-label>{{ label }}</mat-label>
      <ng-content />
      @if (hint) { <mat-hint>{{ hint }}</mat-hint> }
      <mat-error>{{ errorMessage }}</mat-error>
    </mat-form-field>
  `,
})
export class FormFieldComponent {
  @Input() label = '';
  @Input() hint = '';
  @Input() appearance: MatFormFieldAppearance = 'outline';
  @Input() fieldClass = '';
  @Input() control: AbstractControl | null = null;

  get errorMessage(): string {
    return getFirstError(this.control);
  }
}
```

---

## 6. Input de Moeda (CurrencyInput)

```typescript
// shared/components/currency-input/currency-input.component.ts
@Component({
  selector: 'app-currency-input',
  standalone: true,
  imports: [ReactiveFormsModule, MatInputModule],
  template: `
    <input matInput
           [value]="displayValue()"
           (input)="onInput($event)"
           (blur)="onBlur()"
           inputmode="numeric"
           [placeholder]="placeholder"
           [disabled]="isDisabled" />
  `,
})
export class CurrencyInputComponent implements ControlValueAccessor {
  @Input() placeholder = 'R$ 0,00';

  displayValue = signal('');
  isDisabled = false;

  private onChange = (v: number) => {};
  private onTouched = () => {};

  onInput(event: Event) {
    const raw = (event.target as HTMLInputElement).value.replace(/\D/g, '');
    const num = parseInt(raw || '0') / 100;
    this.displayValue.set(this.format(num));
    this.onChange(num);
  }

  onBlur() {
    this.onTouched();
    if (!this.displayValue()) this.displayValue.set('R$ 0,00');
  }

  writeValue(value: number) {
    this.displayValue.set(value != null ? this.format(value) : '');
  }

  private format(n: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
  }

  registerOnChange(fn: any)    { this.onChange = fn; }
  registerOnTouched(fn: any)   { this.onTouched = fn; }
  setDisabledState(d: boolean) { this.isDisabled = d; }
}
```

**Uso em formulário reativo:**
```html
<mat-form-field appearance="outline">
  <mat-label>Valor do Serviço</mat-label>
  <app-currency-input matInput formControlName="valorServicos" />
  <mat-error>{{ getFirstError(form.get('valorServicos')) }}</mat-error>
</mat-form-field>
```
