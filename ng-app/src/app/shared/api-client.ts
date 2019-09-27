import { Injectable } from '@angular/core';
import { formatDate } from '@angular/common';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpResponse, HttpEvent } from '@angular/common/http';
import { HttpClient, HttpParams, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { map, tap, catchError, finalize } from 'rxjs/operators';

@Injectable()
export class HttpErrorHandlerInterceptor implements HttpInterceptor {

    private static readonly _ignore_http_error_interceptor: string = '_ignore_http_error_interceptor';
    public static readonly ignore_http_error_interceptor: string = `${HttpErrorHandlerInterceptor._ignore_http_error_interceptor}:`;

    constructor() { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const reqest = req;
        return next.handle(req).pipe(
            tap(p => {
                if (p instanceof HttpRequest) {
                    console.log(p);
                } else if (p instanceof HttpResponse) {

                }
            }),
            catchError((err: HttpErrorResponse, caught: Observable<any>) => {

                if (req.headers.has(HttpErrorHandlerInterceptor._ignore_http_error_interceptor)) {
                    return throwError(err);
                }

                let message = err.error.Message as string;
                if (err.status === 403 && !message) {
                    message = 'You can not perform that action.';
                }
                if (!message) {
                    message = 'unknown error happened';
                }
                return throwError(err);
            })
        );
    }
}

@Injectable({
    providedIn: 'root'
})
export class ApiClient {
    constructor(private httpClient: HttpClient) { }
}
