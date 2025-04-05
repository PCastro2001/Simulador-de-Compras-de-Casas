from django.utils.safestring import mark_safe
from django import template
from web_project.template_helpers.theme import TemplateHelper
# from django.contrib.auth.decorators import user_passes_test

register = template.Library()

@register.filter
def has_group(user, group):
    if user.groups.filter(name=group).exists():
        return True