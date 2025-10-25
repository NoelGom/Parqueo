from django.db import models

# ---- Choices (mapeo de ENUMs) ----
TIPO_ESPACIO = (
    ("auto", "auto"),
    ("moto", "moto"),
    ("discapacitado", "discapacitado"),
    ("electrico", "electrico"),
)
ESTADO_ESPACIO = (
    ("libre", "libre"),
    ("ocupado", "ocupado"),
    ("reservado", "reservado"),
    ("fuera_servicio", "fuera_servicio"),
)
TIPO_VEHICULO = (("auto", "auto"), ("moto", "moto"))
ESTADO_RESERVA = (
    ("pendiente", "pendiente"),
    ("activa", "activa"),
    ("cancelada", "cancelada"),
    ("finalizada", "finalizada"),
)
METODO_PAGO = (
    ("efectivo", "efectivo"),
    ("tarjeta", "tarjeta"),
    ("tarjeta_en_linea", "tarjeta_en_linea"),
)
ESTADO_PAGO = (
    ("pendiente", "pendiente"),
    ("aprobado", "aprobado"),
    ("fallido", "fallido"),
    ("reembolsado", "reembolsado"),
)
TIPO_SENSOR = (
    ("ultrasonico", "ultrasonico"),
    ("magnetico", "magnetico"),
    ("camaras", "camaras"),
    ("otro", "otro"),
)


class Rol(models.Model):
    id = models.SmallAutoField(primary_key=True, db_column="id")
    nombre = models.CharField(max_length=50, unique=True, db_column="nombre")
    descripcion = models.CharField(max_length=200, null=True, blank=True, db_column="descripcion")

    class Meta:
        db_table = "roles"
        managed = False

    def __str__(self) -> str:
        return self.nombre


class Usuario(models.Model):
    id = models.BigAutoField(primary_key=True, db_column="id")
    nombres = models.CharField(max_length=100, db_column="nombres")
    apellidos = models.CharField(max_length=100, db_column="apellidos")
    email = models.CharField(max_length=120, unique=True, db_column="email")
    telefono = models.CharField(max_length=30, null=True, blank=True, db_column="telefono")
    hash_password = models.CharField(max_length=255, db_column="hash_password")
    rol = models.ForeignKey(Rol, on_delete=models.PROTECT, db_column="rol_id", related_name="usuarios")
    activo = models.BooleanField(default=True, db_column="activo")
    creado_en = models.DateTimeField(db_column="creado_en")
    actualizado_en = models.DateTimeField(db_column="actualizado_en")

    class Meta:
        db_table = "usuarios"
        managed = False

    def __str__(self) -> str:
        return f"{self.nombres} {self.apellidos}"


class Parqueo(models.Model):
    id = models.BigAutoField(primary_key=True, db_column="id")
    nombre = models.CharField(max_length=120, db_column="nombre")
    direccion = models.CharField(max_length=200, null=True, blank=True, db_column="direccion")
    latitud = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True, db_column="latitud")
    longitud = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True, db_column="longitud")
    capacidad = models.PositiveIntegerField(db_column="capacidad")
    horario = models.CharField(max_length=120, null=True, blank=True, db_column="horario")
    creado_en = models.DateTimeField(db_column="creado_en")

    class Meta:
        db_table = "parqueos"
        managed = False

    def __str__(self) -> str:
        return self.nombre


class Espacio(models.Model):
    id = models.BigAutoField(primary_key=True, db_column="id")
    parqueo = models.ForeignKey(Parqueo, on_delete=models.PROTECT, db_column="parqueo_id", related_name="espacios")
    codigo = models.CharField(max_length=20, db_column="codigo")
    nivel = models.CharField(max_length=20, null=True, blank=True, db_column="nivel")
    tipo = models.CharField(max_length=20, choices=TIPO_ESPACIO, default="auto", db_column="tipo")
    estado = models.CharField(max_length=20, choices=ESTADO_ESPACIO, default="libre", db_column="estado")

    class Meta:
        db_table = "espacios"
        managed = False
        constraints = [
            models.UniqueConstraint(fields=["parqueo", "codigo"], name="uk_espacio_parqueo"),
        ]

    def __str__(self) -> str:
        return f"{self.codigo} ({self.parqueo_id})"


class Vehiculo(models.Model):
    id = models.BigAutoField(primary_key=True, db_column="id")
    usuario = models.ForeignKey(Usuario, on_delete=models.PROTECT, db_column="usuario_id", related_name="vehiculos")
    placa = models.CharField(max_length=15, db_column="placa")
    tipo = models.CharField(max_length=10, choices=TIPO_VEHICULO, default="auto", db_column="tipo")
    color = models.CharField(max_length=30, null=True, blank=True, db_column="color")

    class Meta:
        db_table = "vehiculos"
        managed = False
        constraints = [
            models.UniqueConstraint(fields=["usuario", "placa"], name="uk_usuario_placa"),
        ]

    def __str__(self) -> str:
        return f"{self.placa}"


class Reserva(models.Model):
    id = models.BigAutoField(primary_key=True, db_column="id")
    usuario = models.ForeignKey(Usuario, on_delete=models.PROTECT, db_column="usuario_id", related_name="reservas")
    parqueo = models.ForeignKey(Parqueo, on_delete=models.PROTECT, db_column="parqueo_id", related_name="reservas")
    espacio = models.ForeignKey(Espacio, on_delete=models.PROTECT, null=True, blank=True,
                                db_column="espacio_id", related_name="reservas")
    inicio_previsto = models.DateTimeField(db_column="inicio_previsto")
    fin_previsto = models.DateTimeField(db_column="fin_previsto")
    inicio_real = models.DateTimeField(null=True, blank=True, db_column="inicio_real")
    fin_real = models.DateTimeField(null=True, blank=True, db_column="fin_real")
    estado = models.CharField(max_length=12, choices=ESTADO_RESERVA, default="pendiente", db_column="estado")
    total_q = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, db_column="total_q")
    creado_en = models.DateTimeField(db_column="creado_en")

    class Meta:
        db_table = "reservas"
        managed = False
        indexes = [
            models.Index(fields=["usuario", "inicio_previsto"], name="idx_reservas_usuario"),
            models.Index(fields=["parqueo", "inicio_previsto"], name="idx_reservas_parqueo"),
        ]

    def __str__(self) -> str:
        return f"Reserva {self.id} - {self.estado}"


class Pago(models.Model):
    id = models.BigAutoField(primary_key=True, db_column="id")
    reserva = models.ForeignKey(Reserva, on_delete=models.PROTECT, db_column="reserva_id", related_name="pagos")
    metodo = models.CharField(max_length=20, choices=METODO_PAGO, db_column="metodo")
    monto_q = models.DecimalField(max_digits=10, decimal_places=2, db_column="monto_q")
    estado = models.CharField(max_length=20, choices=ESTADO_PAGO, default="pendiente", db_column="estado")
    creado_en = models.DateTimeField(db_column="creado_en")

    class Meta:
        db_table = "pagos"
        managed = False


class Sensor(models.Model):
    id = models.BigAutoField(primary_key=True, db_column="id")
    espacio = models.ForeignKey(Espacio, on_delete=models.PROTECT, db_column="espacio_id", related_name="sensores")
    tipo = models.CharField(max_length=20, choices=TIPO_SENSOR, db_column="tipo")
    identificador_hardware = models.CharField(max_length=80, unique=True, db_column="identificador_hardware")
    activo = models.BooleanField(default=True, db_column="activo")

    class Meta:
        db_table = "sensores"
        managed = False


class Lectura(models.Model):
    id = models.BigAutoField(primary_key=True, db_column="id")
    sensor = models.ForeignKey(Sensor, on_delete=models.PROTECT, db_column="sensor_id", related_name="lecturas")
    valor = models.JSONField(db_column="valor")
    ocupado = models.BooleanField(db_column="ocupado")
    recibido_en = models.DateTimeField(db_column="recibido_en")

    class Meta:
        db_table = "lecturas"
        managed = False
        indexes = [
            models.Index(fields=["sensor", "recibido_en"], name="idx_lecturas_sensor"),
        ]
