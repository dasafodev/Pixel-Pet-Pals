# Arquitectura Modernizada - Pixel Pet Pals Backend

## Descripción General

Esta modernización introduce una arquitectura de capas bien definida para el backend de Pixel Pet Pals, migrando de JavaScript a TypeScript y separando las responsabilidades en diferentes capas.

## Estructura de Capas

### 1. Presentation Layer (Capa de Presentación)
**Ubicación:** `src/controllers/ts/` y `src/routes/ts/`

- **UserController.ts / PostController.ts**: Maneja requests HTTP y se comunican con la capa de servicios
- **UserRoutes.ts / PostRoutes.ts**: Definen endpoints REST modernizados
- **Responsabilidades:**
  - Validación de requests
  - Transformación de datos de entrada/salida
  - Manejo de errores HTTP
  - Autenticación y autorización

### 2. Business Logic Layer (Capa de Lógica de Negocio)
**Ubicación:** `src/services/`

- **UserService.ts**: Contiene las reglas de negocio para gestión de usuarios
- **PostService.ts**: Contiene las reglas de negocio para gestión de publicaciones
- **Responsabilidades:**
  - Validaciones complejas
  - Orquestación de operaciones
  - Lógica de negocio específica
  - Transformación de datos entre capas

### 3. Data Access Layer (Capa de Acceso a Datos)
**Ubicación:** `src/repositories/`

- **UserRepository.ts**: Operaciones de persistencia para usuarios
- **PostRepository.ts**: Operaciones de persistencia para publicaciones
- **Responsabilidades:**
  - Queries optimizadas
  - Operaciones CRUD
  - Manejo de transacciones
  - Abstracción de la base de datos

### 4. Data Transfer Objects (DTOs)
**Ubicación:** `src/dto/`

- **UserDto.ts / PostDto.ts**: Define estructura de datos para requests/responses
- **Responsabilidades:**
  - Validación automática de datos
  - Especificación de formato de datos
  - Reglas de validación

### 5. Types (Tipos TypeScript)
**Ubicación:** `src/types/`

- **User.ts**: Interfaces TypeScript para el modelo de usuario
- **Post.ts**: Interfaces TypeScript para el modelo de publicaciones
- **express.d.ts**: Extensiones de tipos para Express

## Beneficios de la Modernización

### 1. Type Safety
- Detección temprana de errores en tiempo de compilación
- Mejor autocompletado en IDEs
- Interfaces bien definidas

### 2. Separación de Responsabilidades
- Cada capa tiene una responsabilidad específica
- Fácil mantenimiento y testing
- Código más modular y reutilizable

### 3. Escalabilidad
- Fácil agregar nuevas funcionalidades
- Testing unitario simplificado
- Mejor organización del código

### 4. Mantenibilidad
- Código más legible y documentado
- Patrones consistentes
- Menor acoplamiento entre componentes

## Estructura de Archivos

```
src/
├── controllers/
│   ├── ts/
│   │   └── UserController.ts
│   └── userController.js (legacy)
├── routes/
│   ├── ts/
│   │   ├── UserRoutes.ts
│   │   └── index.ts
│   └── users.js (legacy)
├── services/
│   └── UserService.ts
├── repositories/
│   └── UserRepository.ts
├── dto/
│   └── UserDto.ts
├── types/
│   ├── User.ts
│   └── express.d.ts
└── middleware/
    └── ts/
        └── auth.ts
```

## Endpoints Modernizados

### Users
- `GET /api/users` - Obtener todos los usuarios
- `GET /api/users/:id` - Obtener usuario por ID
- `PUT /api/users/profile` - Actualizar perfil de usuario
- `GET /api/users/search` - Buscar usuarios
- `POST /api/users/friends/:friendId` - Agregar amigo
- `DELETE /api/users/friends/:friendId` - Remover amigo
- `GET /api/users/stats` - Obtener estadísticas del usuario

- ### Posts
- `GET /api/posts` - Obtener todas las publicaciones
- `GET /api/posts/:postId` - Obtener publicación por ID
- `GET /api/posts/user/:userId` - Obtener todas las publicaciones de un usuario
- `PUT /api/posts/:postId` - Actualizar una publicación
- `DELETE /api/posts/:postId` - Remover una publicación
- `POST /api/posts/:postId/like` - Dar me gusta o no me gusta a una publicación
- `POST /api/posts/:postId/comments` - Agregar comentario a una publicación
- `DELETE /api/posts/:postId/comments/:commentId` - Eliminar un comentario de una publicación

## Migración Gradual

La arquitectura permite una migración gradual:
1. Los archivos legacy permanecen funcionales
2. Nuevas funcionalidades usan la arquitectura moderna
3. Migración incremental de endpoints existentes

## Scripts Disponibles

```bash
# Compilar TypeScript
npm run build

# Compilar en modo watch
npm run build:watch

# Ejecutar en modo desarrollo con TypeScript
npm run dev:ts

# Ejecutar en modo desarrollo con JavaScript (legacy)
npm run dev
```

## Próximos Pasos

1. **Testing**: Implementar tests unitarios para cada capa
2. **Documentación API**: Generar documentación automática con Swagger
3. **Validación**: Implementar validación automática con Joi o Zod
4. **Logging**: Agregar sistema de logging estructurado
5. **Error Handling**: Implementar manejo centralizado de errores 
