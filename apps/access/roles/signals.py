# Signals
from django.dispatch import receiver
from django.utils.timezone import now
from django.db.models.signals import post_save

# Models
from .models import GroupDescription
from django.contrib.auth.models import Group

# @receiver(post_save, sender=Group)
# def crear_metadata_grupos(sender, instance, created, **kwargs):
#     if created:
#         GroupDescription.objects.create(
#             group = instance,
#             description = 'Descripcion del grupo',
#             bg_color = 'primary',
#             icon = 'ri-user-line',
#             date_created = now(),
#         )