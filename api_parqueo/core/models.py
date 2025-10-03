# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class AuthGroup(models.Model):
    name = models.CharField(unique=True, max_length=150)

    class Meta:
        managed = False
        db_table = 'auth_group'


class AuthGroupPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)
    permission = models.ForeignKey('AuthPermission', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_group_permissions'
        unique_together = (('group', 'permission'),)


class AuthPermission(models.Model):
    name = models.CharField(max_length=255)
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING)
    codename = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'auth_permission'
        unique_together = (('content_type', 'codename'),)


class AuthUser(models.Model):
    password = models.CharField(max_length=128)
    last_login = models.DateTimeField(blank=True, null=True)
    is_superuser = models.IntegerField()
    username = models.CharField(unique=True, max_length=150)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.CharField(max_length=254)
    is_staff = models.IntegerField()
    is_active = models.IntegerField()
    date_joined = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'auth_user'


class AuthUserGroups(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_groups'
        unique_together = (('user', 'group'),)


class AuthUserUserPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    permission = models.ForeignKey(AuthPermission, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_user_permissions'
        unique_together = (('user', 'permission'),)


class DjangoAdminLog(models.Model):
    action_time = models.DateTimeField()
    object_id = models.TextField(blank=True, null=True)
    object_repr = models.CharField(max_length=200)
    action_flag = models.PositiveSmallIntegerField()
    change_message = models.TextField()
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'django_admin_log'


class DjangoContentType(models.Model):
    app_label = models.CharField(max_length=100)
    model = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'django_content_type'
        unique_together = (('app_label', 'model'),)


class DjangoMigrations(models.Model):
    id = models.BigAutoField(primary_key=True)
    app = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    applied = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_migrations'


class DjangoSession(models.Model):
    session_key = models.CharField(primary_key=True, max_length=40)
    session_data = models.TextField()
    expire_date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_session'


class Espacios(models.Model):
    id = models.BigAutoField(primary_key=True)
    parqueo = models.ForeignKey('Parqueos', models.DO_NOTHING)
    codigo = models.CharField(max_length=20)
    nivel = models.CharField(max_length=20, blank=True, null=True)
    tipo = models.CharField(max_length=13)
    estado = models.CharField(max_length=14)

    class Meta:
        managed = False
        db_table = 'espacios'
        unique_together = (('parqueo', 'codigo'),)


class Lecturas(models.Model):
    id = models.BigAutoField(primary_key=True)
    sensor = models.ForeignKey('Sensores', models.DO_NOTHING)
    valor = models.JSONField()
    ocupado = models.IntegerField()
    recibido_en = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'lecturas'


class Pagos(models.Model):
    id = models.BigAutoField(primary_key=True)
    reserva = models.ForeignKey('Reservas', models.DO_NOTHING)
    metodo = models.CharField(max_length=16)
    monto_q = models.DecimalField(max_digits=10, decimal_places=2)
    estado = models.CharField(max_length=11)
    creado_en = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'pagos'


class Parqueos(models.Model):
    id = models.BigAutoField(primary_key=True)
    nombre = models.CharField(max_length=120)
    direccion = models.CharField(max_length=200, blank=True, null=True)
    latitud = models.DecimalField(max_digits=10, decimal_places=7, blank=True, null=True)
    longitud = models.DecimalField(max_digits=10, decimal_places=7, blank=True, null=True)
    capacidad = models.PositiveIntegerField()
    horario = models.CharField(max_length=120, blank=True, null=True)
    creado_en = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'parqueos'


class Reservas(models.Model):
    id = models.BigAutoField(primary_key=True)
    usuario = models.ForeignKey('Usuarios', models.DO_NOTHING)
    parqueo = models.ForeignKey(Parqueos, models.DO_NOTHING)
    espacio = models.ForeignKey(Espacios, models.DO_NOTHING, blank=True, null=True)
    inicio_previsto = models.DateTimeField()
    fin_previsto = models.DateTimeField()
    inicio_real = models.DateTimeField(blank=True, null=True)
    fin_real = models.DateTimeField(blank=True, null=True)
    estado = models.CharField(max_length=10)
    total_q = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    creado_en = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'reservas'


class Roles(models.Model):
    nombre = models.CharField(unique=True, max_length=50)
    descripcion = models.CharField(max_length=200, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'roles'


class Sensores(models.Model):
    id = models.BigAutoField(primary_key=True)
    espacio = models.ForeignKey(Espacios, models.DO_NOTHING)
    tipo = models.CharField(max_length=11)
    identificador_hardware = models.CharField(unique=True, max_length=80)
    activo = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'sensores'


class Usuarios(models.Model):
    id = models.BigAutoField(primary_key=True)
    nombres = models.CharField(max_length=100)
    apellidos = models.CharField(max_length=100)
    email = models.CharField(unique=True, max_length=120)
    telefono = models.CharField(max_length=30, blank=True, null=True)
    hash_password = models.CharField(max_length=255)
    rol = models.ForeignKey(Roles, models.DO_NOTHING)
    activo = models.IntegerField()
    creado_en = models.DateTimeField()
    actualizado_en = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'usuarios'


class Vehiculos(models.Model):
    id = models.BigAutoField(primary_key=True)
    usuario = models.ForeignKey(Usuarios, models.DO_NOTHING)
    placa = models.CharField(max_length=15)
    tipo = models.CharField(max_length=4)
    color = models.CharField(max_length=30, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'vehiculos'
        unique_together = (('usuario', 'placa'),)
