// Schema personalizado para autocompletado en Monaco Editor
export const customEditorSchema = {
  uri: 'http://myserver/custom-schema.json',
  fileMatch: ['*'],
  schema: {
    type: 'object',
    properties: {
      data: {
        type: 'object',
        description: 'Objeto de datos principal',
        properties: {
          saludo: {
            type: 'string',
            description: 'Mensaje de saludo',
            default: 'hola',
          },
          nombre: {
            type: 'string',
            description: 'Nombre del usuario',
          },
          edad: {
            type: 'number',
            description: 'Edad del usuario',
          },
          activo: {
            type: 'boolean',
            description: 'Estado activo del usuario',
          },
        },
      },
      config: {
        type: 'object',
        description: 'Configuración de la aplicación',
        properties: {
          theme: {
            type: 'string',
            enum: ['light', 'dark'],
            description: 'Tema de la aplicación',
          },
          enabled: {
            type: 'boolean',
            description: 'Estado de la configuración',
          },
          timeout: {
            type: 'number',
            description: 'Tiempo de espera en segundos',
          },
        },
      },
      usuarios: {
        type: 'array',
        description: 'Lista de usuarios',
        items: {
          type: 'object',
          properties: {
            id: {
              type: 'number',
              description: 'ID único del usuario',
            },
            nombre: {
              type: 'string',
              description: 'Nombre completo',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Correo electrónico',
            },
          },
        },
      },
    },
  },
};
