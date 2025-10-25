from rest_framework import serializers
from .models import (
    Rol, Usuario, Parqueo, Espacio, Vehiculo, Reserva, Pago, Sensor, Lectura
)

class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = "__all__"

class UsuarioSerializer(serializers.ModelSerializer):
    rol = RolSerializer(read_only=True)
    rol_id = serializers.PrimaryKeyRelatedField(
        queryset=Rol.objects.all(), source="rol", write_only=True
    )
    class Meta:
        model = Usuario
        fields = ["id","nombres","apellidos","email","telefono","hash_password",
                  "rol","rol_id","activo","creado_en","actualizado_en"]

class ParqueoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Parqueo
        fields = "__all__"

class EspacioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Espacio
        fields = ["id","parqueo","codigo","nivel","tipo","estado"]

class VehiculoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehiculo
        fields = "__all__"

class ReservaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reserva
        fields = ["id","usuario","parqueo","espacio","inicio_previsto","fin_previsto",
                  "inicio_real","fin_real","estado","total_q","creado_en"]

class PagoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pago
        fields = "__all__"

class SensorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sensor
        fields = "__all__"

class LecturaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lectura
        fields = "__all__"
