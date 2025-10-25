# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


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


class Reservas(models.Model):
    id = models.BigAutoField(primary_key=True)
    usuario = models.ForeignKey('Usuarios', models.DO_NOTHING)
    parqueo = models.ForeignKey('Parqueos', models.DO_NOTHING)
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
