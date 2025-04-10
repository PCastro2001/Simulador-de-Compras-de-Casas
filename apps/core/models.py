from django.db import models

# Create your models here.
class Visitante(models.Model):
    visitor_id = models.CharField(primary_key=True, max_length=50)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    create_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.visitor_id