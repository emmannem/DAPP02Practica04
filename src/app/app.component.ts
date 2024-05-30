import { Component, OnInit, ViewChild } from '@angular/core';
import { Empleado } from './models/empleado';
import { EmpleadoService } from './services/empleado.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  empleadoDialog!: boolean;
  empleados: Empleado[] = [];
  empleado!: Empleado;
  selectedEmpleado: Empleado[] = [];
  submitted!: boolean;

  @ViewChild('dt') dt: Table | undefined;

  constructor(
    private empleadoService: EmpleadoService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadEmpleados();
  }

  loadEmpleados(): void {
    this.empleadoService.getEmpleados().subscribe({
      next: (data: Empleado[]) => (this.empleados = data),
      error: (err) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar empleados',
        });
      },
    });
  }

  openNew() {
    this.empleado = {
      nombre: '',
      direccion: '',
      telefono: '',
    };

    this.submitted = false;
    this.empleadoDialog = true;
  }

  editEmpleado(empleado: Empleado) {
    this.empleado = { ...empleado };
    this.empleadoDialog = true;
  }

  deleteEmpleado(empleado: Empleado) {
    this.confirmationService.confirm({
      message:
        '¿Estás seguro de que deseas eliminar a ' + empleado.nombre + '?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.empleadoService.deleteEmpleado(empleado.clave!).subscribe({
          next: () => {
            this.empleados = this.empleados.filter(
              (val) => val.clave !== empleado.clave
            );
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Empleado Eliminado',
              life: 3000,
            });
          },
          error: (err) => {
            console.error(err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al eliminar al empleado',
            });
          },
        });
      },
    });
  }

  deleteSelectedEmpleados() {
    this.confirmationService.confirm({
      message:
        '¿Estás seguro de que deseas eliminar los empleados seleccionados?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const deleteRequests = this.selectedEmpleado.map((empleado) =>
          this.empleadoService.deleteEmpleado(empleado.clave!)
        );
        forkJoin(deleteRequests).subscribe({
          next: () => {
            this.empleados = this.empleados.filter(
              (val) => !this.selectedEmpleado.includes(val)
            );
            this.selectedEmpleado = [];
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Empleados Eliminados',
              life: 3000,
            });
          },
          error: (err) => {
            console.error(err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al eliminar a los empleados',
            });
          },
        });
      },
    });
  }

  hideDialog() {
    this.empleadoDialog = false;
    this.submitted = false;
  }

  findIndexById(clave: number): number {
    return this.empleados.findIndex((empleado) => empleado.clave === clave);
  }

  saveEmpleado() {
    this.submitted = true;
    console.log('Empleado a guardar:', this.empleado);
    if (this.empleado.nombre?.trim()) {
      if (this.empleado.clave) {
        // Actualizar persona existente
        this.empleadoService
          .updateEmpleado(this.empleado.clave, this.empleado)
          .subscribe({
            next: (data) => {
              console.log('Empleado actualizada:', data);
              const index = this.findIndexById(this.empleado.clave!);
              if (index !== -1) {
                this.empleados[index] = data;
              }
              console.log(
                'Lista de empleados después de actualizar:',
                this.empleados
              );
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Empleado Actualizado',
                life: 3000,
              });
              this.empleadoDialog = false;
              this.empleado = {} as Empleado;
            },
            error: (err) => {
              console.error(err);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al actualizar al empleado',
              });
            },
          });
      } else {
        // Crear nueva persona
        this.empleadoService.saveEmpleado(this.empleado).subscribe({
          next: (data) => {
            console.log('Empleado creado:', data);
            this.empleados.push(data);
            console.log('Lista de empleados después de crear:', this.empleados);
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Empleado Creado',
              life: 3000,
            });
            this.empleadoDialog = false;
            this.empleado = {} as Empleado;
          },
          error: (err) => {
            console.error(err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al crear al Empleado',
            });
          },
        });
      }
    }
  }

  filterGlobal(event: Event) {
    if (this.dt) {
      this.dt.filterGlobal(
        (event.target as HTMLInputElement).value,
        'contains'
      );
    }
  }
}
