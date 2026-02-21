import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { throwError } from 'rxjs';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    // podríamos mapear aquí mensajes por status si quieres
    // dejo simple y robusto
    // catchError debe importarse si lo activamos con lógica
    // lo configuramos cuando integremos UI de error
    (source) => source
  );
};
