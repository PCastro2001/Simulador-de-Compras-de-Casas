from django.utils.safestring import mark_safe
from django import template
from web_project.template_helpers.theme import TemplateHelper
# from django.contrib.auth.decorators import user_passes_test

register = template.Library()

@register.simple_tag
def get_theme_variables(scope):
    return mark_safe(TemplateHelper.get_theme_variables(scope))

@register.simple_tag
def current_url(request):
    return request.build_absolute_uri()

@register.filter
def has_permission(user, permission):
    if user.has_perm(permission):
        return True

@register.filter
def has_group(user, group):
    if user.groups.filter(name=group).exists():
        return True

@register.filter
def split(value, key):
    return value.split(key)

