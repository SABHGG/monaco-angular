import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

@Component({
  selector: 'app-my-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, MonacoEditorModule],
  templateUrl: './my-editor.html',
  styleUrl: './my-editor.css',
})
export class MyEditor implements OnInit, OnDestroy {
  @ViewChild('editorContainer', { static: true }) editorContainer!: ElementRef;

  editorInstance: any;
  editorLoaded = false;
  libDisposable: any; // Para limpiar la definición anterior

  // JSON inicial (Simulando datos que vienen de un @Input)
  initialData = {
    usuario: {
      nombre: 'Carlos',
      rol: 'admin',
      permisos: ['lectura', 'escritura'],
    },
    configuracion: {
      tema: 'oscuro',
      notificaciones: true,
      limites: {
        maxIntentos: 5,
        tiempoEspera: 300,
      },
    },
    servicios: [
      { id: 1, nombre: 'API Gateway', estado: 'activo' },
      { id: 2, nombre: 'Base de Datos', estado: 'mantenimiento' },
    ],
  };

  jsonString = JSON.stringify(this.initialData, null, 2);

  ngOnInit() {
    this.loadMonaco();
  }

  ngOnDestroy() {
    if (this.editorInstance) {
      this.editorInstance.dispose();
    }
  }

  // --- Lógica Principal: Actualización de Tipos ---

  onJsonChange(newJson: string) {
    try {
      const parsed = JSON.parse(newJson);
      this.updateMonacoTypes(parsed);
    } catch (e) {
      // JSON inválido, ignoramos la actualización de tipos por ahora
    }
  }

  updateMonacoTypes(dataObject: any) {
    if (!this.editorLoaded || !(window as any).monaco) return;

    const monaco = (window as any).monaco;

    // 1. Generamos la definición de tipos (string d.ts) basada en el objeto
    const typeDefinition = this.jsonToDts(dataObject);

    // 2. Envolvemos en un declare var para que sea global
    const libSource = `
      /** * Objeto de contexto inyectado dinámicamente desde el componente padre.
       * Modifica el JSON de la izquierda para ver cambios aquí.
       */
      declare var input: ${typeDefinition};
    `;

    // 3. Limpiamos definición anterior si existe para evitar duplicados/fugas
    if (this.libDisposable) {
      this.libDisposable.dispose();
    }

    // 4. Inyectamos la nueva definición al compilador de TS de Monaco
    this.libDisposable = monaco.languages.typescript.javascriptDefaults.addExtraLib(
      libSource,
      'ts:filename/input.d.ts' // Nombre virtual único
    );

    // Forzar re-evaluación del modelo (opcional, ayuda a veces con el refresco visual)
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });
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

  // --- Carga Manual de Monaco (Solo para que funcione en este entorno sin npm) ---

  loadMonaco() {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs/loader.js';
    script.onload = () => {
      const require = (window as any).require;
      require.config({
        paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' },
      });

      require(['vs/editor/editor.main'], () => {
        this.initEditor();
      });
    };
    document.body.appendChild(script);
  }

  initEditor() {
    const monaco = (window as any).monaco;

    // Configuración recomendada para JS/TS
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      noLib: false, // Usar librerías estándar (Array, String, etc.)
    });

    this.editorInstance = monaco.editor.create(this.editorContainer.nativeElement, {
      value: '// Escribe "contexto." para ver las propiedades del JSON\n\ncontexto.',
      language: 'javascript',
      theme: 'vs-dark',
      automaticLayout: true,
      minimap: { enabled: false },
      fontSize: 14,
      scrollBeyondLastLine: false,
      contextmenu: false,
    });

    this.editorLoaded = true;

    // Inicializar con los datos actuales
    this.updateMonacoTypes(JSON.parse(this.jsonString));
  }
}
