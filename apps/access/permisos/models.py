from django.db import models
from django.contrib.auth.models import Permission

# Create your models here.
class Description_Permission(models.Model):
    permission = models.OneToOneField(Permission, on_delete=models.CASCADE)
    description = models.TextField()
    bg_color = models.CharField(max_length=150)
    icon = models.CharField(max_length=150)
    date_created = models.DateTimeField()
