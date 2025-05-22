from django.db import models
from django.contrib.auth.models import Group


# Create your models here.
class Group_except(models.Model):
    pass

class GroupDescription(models.Model):
    group = models.OneToOneField(Group, on_delete=models.CASCADE)
    description = models.TextField()
    bg_color = models.CharField(max_length=150)
    icon = models.CharField(max_length=150)
    date_created = models.DateTimeField()

    def __str__(self):
        return f"Metadatos de grupo: {self.group.name}"