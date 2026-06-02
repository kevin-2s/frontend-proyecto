const fs = require('fs');

let fileContent = fs.readFileSync('src/app/presentation/roles/roles.component.ts', 'utf8');

// Imports
fileContent = fileContent.replace(
  "import { ToggleSwitchModule } from 'primeng/toggleswitch';",
  "import { ToggleSwitchModule } from 'primeng/toggleswitch';\nimport { SelectModule } from 'primeng/select';\nimport { PasswordModule } from 'primeng/password';"
);

fileContent = fileContent.replace(
  "ToggleSwitchModule",
  "ToggleSwitchModule,\n    SelectModule,\n    PasswordModule"
);

// Template replacement (Remove Roles button and view, add User Dialog)
const templateRegex = /<div class="module-header" style="align-items: flex-start;">[\s\S]*?(?=<!-- USUARIOS VIEW)/;
const newHeader = `<div class="module-header" style="align-items: flex-start;">
        <div class="flex flex-col gap-3">
          <h3 class="page-title mb-0">
            <i class="pi pi-shield"></i> Accesos y Permisos
          </h3>
          <div class="flex gap-2">
            <button pButton label="Usuarios" icon="pi pi-users"
              [class.p-button-outlined]="currentView !== 'usuarios'"
              [class.btn-add]="currentView === 'usuarios'"
              class="p-button-sm rounded-xl"
              (click)="setView('usuarios')"></button>
            <button pButton label="Permisos" icon="pi pi-lock"
              [class.p-button-outlined]="currentView !== 'permisos'"
              [class.btn-add]="currentView === 'permisos'"
              class="p-button-sm rounded-xl"
              (click)="setView('permisos')"></button>
          </div>
        </div>
        <div class="header-actions">
          <div class="search-wrapper">
            <i class="pi pi-search"></i>
            <input pInputText type="text" [(ngModel)]="filtro" (input)="filtrarGlobal()" placeholder="Buscar..." class="search-input" />
          </div>
          <button *ngIf="currentView === 'usuarios'" pButton label="Crear Usuario" icon="pi pi-user-plus" class="rounded-xl font-bold bg-slate-900 text-white hover:bg-black outline-none cursor-pointer border-none h-[42px] ml-2" (click)="openNewUsuario()"></button>
        </div>
      </div>

      `;
fileContent = fileContent.replace(templateRegex, newHeader);

// Update Usuarios view table
const tableRegex = /<p-table[\s\S]*?<\/p-table>/;
const newTable = `<p-table [value]="usuariosFiltrados" [paginator]="true" [rows]="10" styleClass="modern-table" [loading]="loading">
            <ng-template pTemplate="header">
              <tr>
                <th style="width: 100px">ID</th>
                <th>Nombre Completo</th>
                <th>Correo Electrónico</th>
                <th>Rol</th>
                <th>Estado</th>
                <th style="width:120px; text-align:center">Acciones</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-u>
              <tr>
                <td><span class="id-badge">#{{ u.id || u.id_usuario }}</span></td>
                <td class="font-bold">{{ u.nombre || u.nombreCompleto }}</td>
                <td class="text-slate-500">{{ u.correo }}</td>
                <td>
                  <p-tag [value]="getRolNombre(u.id_rol)" [severity]="getRolSeverity(u.id_rol)" styleClass="text-[10px] px-2 py-0.5 rounded-md"></p-tag>
                </td>
                <td>
                   <p-tag [value]="u.estado ? 'ACTIVO' : 'INACTIVO'" [severity]="u.estado ? 'success' : 'danger'" styleClass="px-3 py-1 rounded-lg text-[10px]"></p-tag>
                </td>
                <td>
                  <div class="flex items-center justify-center gap-1">
                    <button type="button" (click)="editarUsuario(u)" class="w-8 h-8 rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer outline-none border-none bg-transparent">
                      <i class="pi pi-pencil"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr><td colspan="6" class="empty-message"><i class="pi pi-users"></i><p>No hay usuarios registrados</p></td></tr>
            </ng-template>
          </p-table>`;
fileContent = fileContent.replace(tableRegex, newTable);

// Add user dialog
const dialogRegex = /<!-- Dialog para Crear\/Editar Rol -->/;
const userDialog = `
    <!-- Dialog para Crear/Editar Usuario -->
    <p-dialog
      [header]="esNuevoUsuario ? 'Añadir Usuario' : 'Editar Usuario'"
      [(visible)]="displayUserDialog"
      [modal]="true"
      [style]="{ width: '600px' }"
      [draggable]="false"
      styleClass="custom-dialog-usuario-clean"
      maskStyleClass="backdrop-blur-sm bg-black/40"
      [showHeader]="true"
    >
      <div class="flex flex-col gap-4 mt-2">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex flex-col gap-1.5 flex-1">
            <label class="text-sm font-bold text-gray-900">Nombre</label>
            <input pInputText [(ngModel)]="usuarioForm.nombre" class="w-full !bg-gray-100 !border-transparent focus:!border-gray-300 focus:!bg-white !text-gray-900 !py-2.5 !px-3 !rounded-md transition-all outline-none" />
          </div>
        </div>
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex flex-col gap-1.5 flex-1">
            <label class="text-sm font-bold text-gray-900">Correo Electrónico</label>
            <input pInputText type="email" [(ngModel)]="usuarioForm.correo" class="w-full !bg-gray-100 !border-transparent focus:!border-gray-300 focus:!bg-white !text-gray-900 !py-2.5 !px-3 !rounded-md transition-all outline-none" />
          </div>
          <div class="flex flex-col gap-1.5 flex-1">
            <label class="text-sm font-bold text-gray-900">Rol</label>
            <div class="flex items-center gap-2">
              <p-select [options]="roles" [(ngModel)]="usuarioForm.id_rol" optionLabel="nombre" optionValue="id_rol" placeholder="Selecciona" styleClass="w-full !bg-gray-100 !border-transparent hover:!border-gray-300 focus:!border-gray-300 !text-gray-900 !rounded-md transition-all" appendTo="body"></p-select>
              <button pButton icon="pi pi-plus" class="p-button-outlined p-button-sm w-10 h-10 flex-shrink-0" (click)="openNewRolDialog()"></button>
            </div>
          </div>
        </div>
        <div class="flex flex-col sm:flex-row gap-4" *ngIf="esNuevoUsuario">
          <div class="flex flex-col gap-1.5 flex-1">
            <label class="text-sm font-bold text-gray-900">Contraseña</label>
            <p-password [(ngModel)]="usuarioForm.password" [feedback]="false" styleClass="w-full" [inputStyle]="{'width':'100%'}" inputStyleClass="w-full !bg-gray-100 !border-transparent focus:!border-gray-300 focus:!bg-white !text-gray-900 !py-2.5 !px-3 !rounded-md transition-all outline-none" [toggleMask]="true" appendTo="body"></p-password>
          </div>
        </div>
        <div class="dialog-footer mt-4">
          <button pButton label="Cancelar" class="btn-cancelar" (click)="displayUserDialog = false"></button>
          <button pButton [label]="savingUser ? 'Guardando...' : 'Guardar'" class="btn-guardar" (click)="guardarUsuario()" [disabled]="savingUser"></button>
        </div>
      </div>
    </p-dialog>

    <!-- Dialog para Crear/Editar Rol -->`;
fileContent = fileContent.replace(dialogRegex, userDialog);

// TS Variables
fileContent = fileContent.replace(
  "currentView: 'roles' | 'usuarios' | 'permisos' = 'roles';",
  "currentView: 'usuarios' | 'permisos' = 'usuarios';\n  displayUserDialog = false;\n  esNuevoUsuario = true;\n  savingUser = false;\n  usuarioForm: any = {};"
);

fileContent = fileContent.replace(
  "setView(view: 'roles' | 'usuarios' | 'permisos') {",
  "setView(view: 'usuarios' | 'permisos') {"
);

fileContent = fileContent.replace(
  /filtrarGlobal\(\) \{[\s\S]*?\}/,
  `filtrarGlobal() {
    const f = this.filtro.toLowerCase();
    this.usuariosFiltrados = this.usuarios.filter((u) =>
      (u.nombre || u.nombreCompleto || '').toLowerCase().includes(f) ||
      (u.correo || '').toLowerCase().includes(f)
    );
  }`
);

// Remove rolesFiltrados assignments
fileContent = fileContent.replace("this.rolesFiltrados = data;", "");
fileContent = fileContent.replace("this.rolesFiltrados = [];", "");
fileContent = fileContent.replace("rolesFiltrados: Rol[] = [];", "");


// Add user methods
const endOfClassRegex = /getRolSeverity[\s\S]*?\n\}/;
const userMethods = `getRolSeverity(id_rol: any): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const nombre = this.getRolNombre(id_rol).toUpperCase();
    if (nombre.includes('ADMIN')) return 'success';
    if (nombre.includes('INSTRUCT')) return 'info';
    return 'secondary';
  }

  openNewUsuario() {
    this.esNuevoUsuario = true;
    this.usuarioForm = { nombre: '', correo: '', id_rol: null, password: '' };
    this.displayUserDialog = true;
  }

  editarUsuario(u: any) {
    this.esNuevoUsuario = false;
    this.usuarioForm = { ...u, password: '' };
    this.displayUserDialog = true;
  }

  guardarUsuario() {
    if (!this.usuarioForm.nombre || !this.usuarioForm.correo || !this.usuarioForm.id_rol) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Faltan campos requeridos' });
      return;
    }
    this.savingUser = true;

    const reqData = {
      nombre: this.usuarioForm.nombre,
      correo: this.usuarioForm.correo,
      id_rol: this.usuarioForm.id_rol,
      ...(this.usuarioForm.password ? { password: this.usuarioForm.password } : {})
    };

    if (this.esNuevoUsuario) {
      this.usuarioService.create(reqData as any).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario creado' });
          this.displayUserDialog = false;
          this.savingUser = false;
          this.cargarUsuarios();
        },
        error: (err) => {
          this.savingUser = false;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Error al crear' });
        }
      });
    } else {
      this.usuarioService.update(this.usuarioForm.id_usuario || this.usuarioForm.id, reqData).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario actualizado' });
          this.displayUserDialog = false;
          this.savingUser = false;
          this.cargarUsuarios();
        },
        error: (err) => {
          this.savingUser = false;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Error al actualizar' });
        }
      });
    }
  }
}`;
fileContent = fileContent.replace(endOfClassRegex, userMethods);

// Update guardar rol to auto-select
fileContent = fileContent.replace(
  "this.cargarRoles();",
  "this.cargarRoles();\n        if (res && res.data && res.data.id_rol) { this.usuarioForm.id_rol = res.data.id_rol; }"
);


fs.writeFileSync('src/app/presentation/roles/roles.component.ts', fileContent);
