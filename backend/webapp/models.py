from django.contrib.auth.models import User
from django.db import models

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    salary = models.PositiveIntegerField()
    household_size = models.PositiveIntegerField(default=1)
    rent = models.PositiveIntegerField(default=0)
    region = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return self.user.username
