import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MyEditor } from './my-editor/my-editor';
import { JsonPipe } from '@angular/common';
@Component({
  selector: 'app-root',
  imports: [FormsModule, MyEditor, JsonPipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  // Datos de contexto iniciales
  contextData: any = {};

  // Contenido del editor
  editorContent = '// Escribe aquí tu código...\ncontexto.';

  // Modelo para el formulario
  newPropName = '';
  newPropType = 'string';

  addProperty() {
    if (!this.newPropName.trim()) return;

    let defaultValue: any;
    switch (this.newPropType) {
      case 'string':
        defaultValue = 'valor texto';
        break;
      case 'number':
        defaultValue = 0;
        break;
      case 'boolean':
        defaultValue = true;
        break;
      case 'object':
        defaultValue = { ejemplo: 'dato' };
        break;
      case 'array':
        defaultValue = [1, 2, 3];
        break;
      default:
        defaultValue = null;
    }

    // Creamos una nueva referencia del objeto para disparar el cambio en el hijo
    this.contextData = {
      ...this.contextData,
      [this.newPropName]: defaultValue,
    };

    this.newPropName = '';
  }
}
