# REGISTRO DE SEGUIMIENTO Y TESTING

ESTADOS
✅ OK / PASS: Prueba superada.

❌ FAIL / ERROR: Prueba fallida (se encontró un bug).

⏳ PEND / TO DO: Pendiente de probar.

⚠️ RE-TEST: Falló antes y necesita ser re-testeado tras la corrección.

--- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---

## [12/11/2025]

### Tareas Completadas

-[1] Se creo el menu sidebar para navegar por las distintas pantallas.
-[2] Se crearon los ABMs correspondientes a clientes, productos y ordenes.
-[3] Se escribió un seeder completo con usuarios, clientes, productos, ordenes y facturas para el testeo general.
-[4] Se posibilita el crear una factura parcialmente o completa dependiendo de si la orden esta en fecha limite.
-[5] Se agregaron los logos correspondientes a la app.

### Historia de Usuario (Pruebas)

**Como** [Administrador]
-[1] Navegar, asegurando que cada vista corresponda a un ABM o funcionalidad particular (Falta maquetear el menu principal o quitarlo). ✅ OK / PASS
-[2] Crear, editar y eliminar clientes desde el index. ✅ OK / PASS
      Crear, editar, eliminar, agregar stock y precio por dia a los productos desde el index. ✅ OK / PASS
      Crear, editar, eliminar y agregar movimientos a las ordenes desde el index (Tambien ver que se puede crear una orden sin Stock). ⏳ PEND / TO DO 
-[3] Correr seeder, revisar numeros en productos, ordenes y facturas. ✅ OK / PASS
-[4] Agregar movimientos desde ordenes, quitando la mitad de la orden y otra completa por ejemplo, luego crear factura y revisar fechas y montos. ⏳ PEND / TO DO

--- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---

## [15/11/2025]

### Tareas Completadas

-[1] Se creo ABM para usuarios propios de RZ (Administrador, trabajador, etc).
-[2] Cambiamos el index de facturas por una tabla y cada factura con su show.
-[3] Agregamos nuevo rol Trabajador(worker) en los seeders para crearlo junto con admin.
-[ ]
-[ ]

### Historia de Usuario (Pruebas)

**Como** [Administrador]
Funcionalidad, ej: ver un listado de todos los usuarios del sistema

--- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---