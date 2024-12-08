import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import {
  HttpEventType,
  HttpHandlerFn,
  HttpRequest,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { tap } from 'rxjs';

// インターセプター（HttpInterceptor）は、HttpClient を使用する際に、HTTP リクエストやレスポンスを 途中で処理するための仕組み です。
// リクエストがサーバーに送信される前や、レスポンスがクライアントに返される前に、特定の処理を挟むことができます。
// サーバーサイドのミドルウェアと同じように、リクエストとレスポンスの流れを途中で制御する役割を持ちます。

function loggingInterceptor(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
) {
  // const req = request.clone({
  //   headers: request.headers.set('X-DEBUG', 'TESTING'),
  // });
  console.log(request);
  return next(request).pipe(
    tap({
      next: (event) => {
        if (event.type === HttpEventType.Response) {
          console.log('[Incoming response]');
          console.log(event.status);
        }
      },
    })
  );
}

bootstrapApplication(AppComponent, {
  providers: [provideHttpClient(withInterceptors([]))], // HttpRequest使えるように
}).catch((err) => console.error(err));
