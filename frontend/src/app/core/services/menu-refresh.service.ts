import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MenuRefreshService {
    private _refresh$ = new Subject<void>();
    readonly refresh$ = this._refresh$.asObservable();

    emitirRefresh(): void {
        this._refresh$.next();
    }
}