import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { Empleado } from '../models/empleado';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class EmpleadoService {
  private apiUrl = '/DAPP02Practica03-0.0.1-SNAPSHOT/api/empleado';
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Basic ' + btoa('adsoft:super'),
    }),
  };

  constructor(
    private http: HttpClient,
    private messageService: MessageService
  ) {}

  getEmpleados(): Observable<Empleado[]> {
    return this.http
      .get<Empleado[]>(this.apiUrl, this.httpOptions)
      .pipe(catchError(this.handleError.bind(this)));
  }

  saveEmpleado(data: Empleado): Observable<Empleado> {
    return this.http
      .post<Empleado>(this.apiUrl, data, this.httpOptions)
      .pipe(catchError(this.handleError.bind(this)));
  }

  deleteEmpleado(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`, this.httpOptions)
      .pipe(catchError(this.handleError.bind(this)));
  }

  updateEmpleado(id: number, data: Empleado): Observable<Empleado> {
    return this.http
      .put<Empleado>(`${this.apiUrl}/${id}`, data, this.httpOptions)
      .pipe(catchError(this.handleError.bind(this)));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Error desconocido';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // El servidor devolvió un código de error
      errorMessage = `Código de error: ${error.status}, mensaje: ${error.message}`;
    }
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: errorMessage,
      life: 5000,
    });
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
