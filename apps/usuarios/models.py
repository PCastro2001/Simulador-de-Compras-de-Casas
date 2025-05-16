from django.db import models

# Create your models here.

class Region(models.Model):
    numero = models.IntegerField()
    capital = models.CharField(max_length=150)
    nombre = models.CharField(max_length=150)

class Provincia(models.Model):
    nombre = models.CharField(max_length=150)
    capital_provincial = models.CharField(max_length=150)
    region = models.ForeignKey(Region, on_delete=models.CASCADE)

class Comuna(models.Model):
    nombre = models.CharField(max_length=150)
    provincia = models.ForeignKey(Provincia, on_delete=models.CASCADE)

class Usuario(models.Model):
    nombre = models.CharField(max_length=150)
    apellido = models.CharField(max_length=150)
    rut = models.CharField(max_length=12)
    email = models.EmailField(max_length=150)
    telefono = models.CharField(max_length=12)
    edad = models.IntegerField()
    # imagen = models.ImageField(upload_to="/user_image/")

    

