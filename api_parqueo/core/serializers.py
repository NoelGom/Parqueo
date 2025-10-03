from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import Espacios, Lecturas, Pagos, Parqueos, Reservas, Roles, Sensores, Usuarios, Vehiculos


class RolesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Roles
        fields = "__all__"


class UsuariosSerializer(serializers.ModelSerializer):
    # Campo de entrada 
    password = serializers.CharField(write_only=True, required=False, allow_blank=False)

    class Meta:
        model = Usuarios
        # Oculte el campo hash_password para que no salga en la API
        exclude = ["hash_password"]

    def create(self, validated_data):
        pwd = validated_data.pop("password", None)
        user = super().create(validated_data)
        if pwd:
            user.hash_password = make_password(pwd)
            user.save(update_fields=["hash_password"])
        return user

    def update(self, instance, validated_data):
        pwd = validated_data.pop("password", None)
        user = super().update(instance, validated_data)
        if pwd:
            user.hash_password = make_password(pwd)
            user.save(update_fields=["hash_password"])
        return user


class ParqueosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Parqueos
        fields = "__all__"


class EspaciosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Espacios
        fields = "__all__"


class VehiculosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehiculos
        fields = "__all__"


class ReservasSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservas
        fields = "__all__"


class PagosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pagos
        fields = "__all__"


class SensoresSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sensores
        fields = "__all__"


class LecturasSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lecturas
        fields = "__all__"
