import { Component, OnInit, ViewChild } from '@angular/core';
import { Empleado } from './models/empleado';
import { EmpleadoService } from './services/empleado.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';

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
      error: (err) => console.error(err),
    });
  }

  openNew() {
    this.empleado = {
      id: '',
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
        this.empleadoService.deleteEmpleado(empleado.id!).subscribe({
          next: () => {
            this.empleados = this.empleados.filter(
              (val) => val.id !== empleado.id
            );
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Empleado Eliminado',
              life: 3000,
            });
          },
          error: (err) => console.error(err),
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
        this.selectedEmpleado.forEach((empleado) => {
          this.empleadoService.deleteEmpleado(empleado.id!).subscribe({
            next: () => {
              this.empleados = this.empleados.filter(
                (val) => val.id !== empleado.id
              );
            },
            error: (err) => console.error(err),
          });
        });
        this.selectedEmpleado = [];
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Empleados Eliminados',
          life: 3000,
        });
      },
    });
  }

  hideDialog() {
    this.empleadoDialog = false;
    this.submitted = false;
  }

  findIndexById(id: string): number {
    let index = -1;
    for (let i = 0; i < this.empleados.length; i++) {
      if (this.empleados[i].id === id) {
        index = i;
        break;
      }
    }

    return index;
  }

  saveEmpleado() {
    this.submitted = true;

    if (this.empleado.nombre?.trim()) {
      if (this.empleado.id) {
        // Actualizar empleado existente
        this.empleadoService
          .updateEmpleado(this.empleado.id, this.empleado)
          .subscribe({
            next: (data) => {
              const index = this.findIndexById(this.empleado.id!);
              if (index !== -1) {
                this.empleados[index] = data;
              }
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Empleado Actualizado',
                life: 3000,
              });
              this.empleadoDialog = false;
              this.empleado = {} as Empleado;
            },
            error: (err) => console.error(err),
          });
      } else {
        // Crear nuevo empleado
        this.empleadoService.saveEmpleado(this.empleado).subscribe({
          next: (data) => {
            this.empleados.push(data);
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Empleado Creado',
              life: 3000,
            });
            this.empleadoDialog = false;
            this.empleado = {} as Empleado;
          },
          error: (err) => console.error(err),
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
