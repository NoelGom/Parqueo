from django.contrib import admin
from .models import (
    Roles, Usuarios, Parqueos, Espacios, Vehiculos,
    Reservas, Pagos, Sensores, Lecturas
)

# Utilidad: devuelve solo los nombres de campo que sí existen en el modelo
def existing_fields(model, *names):
    model_fields = {f.name for f in model._meta.get_fields()}
    return [n for n in names if n in model_fields]

# --------- ROLES ---------
@admin.register(Roles)
class RolesAdmin(admin.ModelAdmin):
    def get_list_display(self, request):
        base = ["id"]
        extras = existing_fields(Roles, "nombre", "descripcion", "creado_en", "actualizado_en", "activo")
        return tuple(base + extras)

    def get_search_fields(self, request):
        return tuple(existing_fields(Roles, "nombre", "descripcion"))

# --------- USUARIOS ---------
@admin.register(Usuarios)
class UsuariosAdmin(admin.ModelAdmin):
    # Ocultamos hash_password del formulario
    exclude = tuple(existing_fields(Usuarios, "hash_password"))
    readonly_fields = tuple(existing_fields(Usuarios, "creado_en", "actualizado_en"))

    def get_list_display(self, request):
        base = ["id"]
        extras = existing_fields(
            Usuarios,
            "nombres", "apellidos", "email", "telefono", "rol", "activo", "creado_en"
        )
        return tuple(base + extras)

    def get_search_fields(self, request):
        return tuple(existing_fields(Usuarios, "nombres", "apellidos", "email"))

    def get_list_filter(self, request):
        return tuple(existing_fields(Usuarios, "rol", "activo", "creado_en"))

# --------- PARQUEOS ---------
@admin.register(Parqueos)
class ParqueosAdmin(admin.ModelAdmin):
    def get_list_display(self, request):
        base = ["id"]
        extras = existing_fields(Parqueos, "nombre", "direccion", "creado_en", "activo")
        return tuple(base + extras)

    def get_search_fields(self, request):
        return tuple(existing_fields(Parqueos, "nombre", "direccion"))

    def get_list_filter(self, request):
        return tuple(existing_fields(Parqueos, "activo", "creado_en"))

# --------- ESPACIOS ---------
@admin.register(Espacios)
class EspaciosAdmin(admin.ModelAdmin):
    def get_list_display(self, request):
        base = ["id"]
        # Nota: si tu campo es "disponible" u "ocupado" o "estado", se adapta solo
        extras = existing_fields(Espacios, "parqueo", "codigo", "disponible", "ocupado", "estado", "creado_en")
        return tuple(base + extras)

    def get_list_filter(self, request):
        return tuple(existing_fields(Espacios, "parqueo", "disponible", "ocupado", "estado"))

    def get_search_fields(self, request):
        return tuple(existing_fields(Espacios, "codigo"))

# --------- VEHICULOS ---------
@admin.register(Vehiculos)
class VehiculosAdmin(admin.ModelAdmin):
    def get_list_display(self, request):
        base = ["id"]
        extras = existing_fields(Vehiculos, "placa", "usuario", "creado_en")
        return tuple(base + extras)

    def get_search_fields(self, request):
        return tuple(existing_fields(Vehiculos, "placa", "usuario__nombres", "usuario__apellidos"))

# --------- RESERVAS ---------
@admin.register(Reservas)
class ReservasAdmin(admin.ModelAdmin):
    def get_list_display(self, request):
        base = ["id"]
        # Si tus fechas se llaman "inicio"/"fin" o "fecha_inicio"/"fecha_fin", se adapta
        extras = existing_fields(Reservas, "usuario", "espacio", "inicio", "fin", "fecha_inicio", "fecha_fin", "estado")
        return tuple(base + extras)

    def get_list_filter(self, request):
        return tuple(existing_fields(Reservas, "estado", "inicio", "fin", "fecha_inicio", "fecha_fin"))

    def get_search_fields(self, request):
        return tuple(existing_fields(Reservas, "usuario__nombres", "usuario__apellidos", "espacio__codigo"))

# --------- PAGOS ---------
@admin.register(Pagos)
class PagosAdmin(admin.ModelAdmin):
    def get_list_display(self, request):
        base = ["id"]
        # Si usás "monto" o "total", o fechas "fecha"/"fecha_pago", se adapta
        extras = existing_fields(Pagos, "reserva", "monto", "total", "estado", "fecha", "fecha_pago", "creado_en")
        return tuple(base + extras)

    def get_list_filter(self, request):
        return tuple(existing_fields(Pagos, "estado", "fecha", "fecha_pago", "creado_en"))

# --------- SENSORES ---------
@admin.register(Sensores)
class SensoresAdmin(admin.ModelAdmin):
    def get_list_display(self, request):
        base = ["id"]
        extras = existing_fields(Sensores, "espacio", "tipo", "activo", "creado_en")
        return tuple(base + extras)

    def get_list_filter(self, request):
        return tuple(existing_fields(Sensores, "tipo", "activo"))

# --------- LECTURAS ---------
@admin.register(Lecturas)
class LecturasAdmin(admin.ModelAdmin):
    def get_list_display(self, request):
        base = ["id"]
        # Si tu timestamp es "fecha_hora" o "fecha" o "creado_en", se adapta
        extras = existing_fields(Lecturas, "sensor", "valor", "fecha_hora", "fecha", "creado_en")
        return tuple(base + extras)

    def get_list_filter(self, request):
        return tuple(existing_fields(Lecturas, "fecha_hora", "fecha", "creado_en"))
