import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'currencyBr',
    standalone: true
})
export class CurrencyBrPipe implements PipeTransform {
    transform(value: number | string | null | undefined): string {
        if (value === null || value === undefined) return 'R$ 0,00';

        const numberValue = typeof value === 'string' ? parseFloat(value) : value;

        if (isNaN(numberValue)) return 'R$ 0,00';

        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(numberValue);
    }
}
