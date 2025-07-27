# Configuración de TypeScript - Pixel Pet Pals Backend

## Instalación de Dependencias

Para habilitar la nueva arquitectura TypeScript, necesitas instalar las dependencias de desarrollo:

```bash
# Instalar TypeScript y tipos
npm install --save-dev typescript @types/node @types/express @types/bcryptjs @types/jsonwebtoken @types/mongoose @types/multer @types/cors ts-node

# O si prefieres usar yarn
yarn add -D typescript @types/node @types/express @types/bcryptjs @types/jsonwebtoken @types/mongoose @types/multer @types/cors ts-node
```

## Scripts Disponibles

Después de instalar las dependencias, puedes usar estos scripts:

```bash
# Compilar TypeScript a JavaScript
npm run build

# Compilar en modo watch (recompila automáticamente)
npm run build:watch

# Ejecutar en modo desarrollo con TypeScript
npm run dev:ts

# Ejecutar en modo desarrollo con JavaScript (legacy)
npm run dev
```

## Estructura de Archivos Creada

```
backend/
├── src/
│   ├── controllers/
│   │   └── ts/
│   │       └── UserController.ts
│   ├── routes/
│   │   └── ts/
│   │       ├── UserRoutes.ts
│   │       └── index.ts
│   ├── services/
│   │   └── UserService.ts
│   ├── repositories/
│   │   └── UserRepository.ts
│   ├── dto/
│   │   └── UserDto.ts
│   ├── types/
│   │   ├── User.ts
│   │   └── express.d.ts
│   ├── middleware/
│   │   └── ts/
│   │       └── auth.ts
│   └── server-modern.ts
├── tsconfig.json
├── package.json (actualizado)
├── ARCHITECTURE.md
└── SETUP.md
```

## Configuración de TypeScript

El archivo `tsconfig.json` ya está configurado con:

- Target: ES2020
- Module: CommonJS
- Strict mode habilitado
- Source maps para debugging
- Declaraciones de tipos

## Migración Gradual

La arquitectura permite una migración gradual:

1. **Fase 1**: Instalar dependencias y configurar TypeScript
2. **Fase 2**: Migrar funcionalidades de usuarios
3. **Fase 3**: Migrar funcionalidades de posts
4. **Fase 4**: Migrar funcionalidades restantes

## Beneficios Inmediatos

- **Type Safety**: Detección de errores en tiempo de compilación
- **Mejor IDE Support**: Autocompletado y navegación mejorada
- **Documentación**: Interfaces TypeScript como documentación
- **Mantenibilidad**: Código más legible y organizado

## Próximos Pasos

1. Instalar las dependencias de TypeScript
2. Compilar el proyecto: `npm run build`
3. Probar la nueva arquitectura: `npm run dev:ts`
4. Migrar gradualmente los endpoints existentes
5. Implementar tests unitarios
6. Agregar validación automática con Joi o Zod

## Solución de Problemas

### Error: Cannot find module 'express'
```bash
npm install --save-dev @types/express
```

### Error: Cannot find module 'mongoose'
```bash
npm install --save-dev @types/mongoose
```

### Error de compilación TypeScript
```bash
# Limpiar y recompilar
rm -rf dist/
npm run build
```

### Error de permisos npm
```bash
# Usar --force si hay problemas de permisos
npm install --save-dev typescript @types/node --force
``` 