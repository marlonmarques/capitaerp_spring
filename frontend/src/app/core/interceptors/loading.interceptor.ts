import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private excludedUrls = ['/assets/', 'i18n'];

  constructor(private loadingService: LoadingService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const shouldIgnore = this.excludedUrls.some(url => request.url.includes(url));
    
    if (!shouldIgnore) {
      this.loadingService.show();
    }

    return next.handle(request).pipe(
      finalize(() => {
        if (!shouldIgnore) {
          this.loadingService.hide();
        }
      })
    );
  }
}