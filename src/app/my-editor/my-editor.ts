import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

@Component({
  selector: 'app-my-editor',
  standalone: true,
  imports: [FormsModule, MonacoEditorModule],
  templateUrl: './my-editor.html',
  styleUrl: './my-editor.css',
})
export class MyEditor implements OnChanges, OnDestroy {
  // Opciones del editor
  editorOptions = {
    theme: 'vs-dark',
    language: 'javascript',
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: 14,
  };

  // Contenido del editor (Two-way binding)
  @Input() code = '';
  @Output() codeChange = new EventEmitter<string>();

  // Datos para el autocompletado (Input dinámico)
  @Input() contextData: any = {
    usuario: {
      nombre: 'Carlos',
      rol: 'admin',
      permisos: ['lectura', 'escritura'],
    },
    configuracion: {
      tema: 'oscuro',
      notificaciones: true,
    },
  };

  private libDisposable: any;
  private isEditorInitialized = false;

  ngOnChanges(changes: SimpleChanges) {
    // Si cambia contextData y el editor ya está listo, actualizamos los tipos
    if (changes['contextData'] && this.isEditorInitialized) {
      this.updateMonacoLibs();
    }
    console.log(this.code);
  }

  ngOnDestroy() {
    // Limpieza al destruir el componente para evitar fugas de memoria
    if (this.libDisposable) {
      this.libDisposable.dispose();
    }
  }

  onEditorInit(editor: any) {
    this.isEditorInitialized = true;
    this.updateMonacoLibs();
  }

  private updateMonacoLibs() {
    const monaco = (window as any).monaco;
    if (!monaco) return;

    // 1. IMPORTANTE: Limpiar la librería anterior para evitar acumulación
    if (this.libDisposable) {
      this.libDisposable.dispose();
    }

    // 2. Generar nueva definición de tipos
    const typeDefinition = this.jsonToDts(this.contextData);

    // 3. Registrar tipos globales y guardar la referencia para limpiar después
    this.libDisposable = monaco.languages.typescript.javascriptDefaults.addExtraLib(
      `declare var contexto: ${typeDefinition};`,
      'ts:filename/contexto.d.ts' // Mismo nombre sobrescribe virtualmente, pero dispose() es más seguro
    );
  }

  /**
   * Convierte recursivamente un objeto JS a una cadena de definición de interfaz TypeScript
   */
  jsonToDts(obj: any, indent = 0): string {
    const space = '  '.repeat(indent);

    if (obj === null) return 'any';
    if (Array.isArray(obj)) {
      if (obj.length > 0) {
        // Asumimos que todos los elementos del array tienen la misma estructura que el primero
        const type = this.jsonToDts(obj[0], indent);
        return `${type}[]`;
      }
      return 'any[]';
    }

    if (typeof obj === 'object') {
      let buffer = '{\n';
      for (const key in obj) {
        // Generamos un JSDoc básico para que se vea bonito en el editor
        buffer += `${space}  /** Propiedad: ${key} */\n`;
        // Recursividad para la propiedad
        buffer += `${space}  ${key}: ${this.jsonToDts(obj[key], indent + 1)};\n`;
      }
      buffer += `${space}}`;
      return buffer;
    }

    // Tipos primitivos
    return typeof obj;
  }
}
