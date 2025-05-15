from django import forms
from django.contrib.auth.models import Group, Permission

class AddRoleForm(forms.Form):
    rolename = forms.CharField(max_length=150)
    permissions = forms.ModelMultipleChoiceField(
        queryset=Permission.objects.all(),
        required=True
    )

    def clean_rolename(self):
        rolename = self.cleaned_data['rolename']
        if Group.objects.filter(name__iexact=rolename).exists():
            raise forms.ValidationError("Ya existe un grupo con ese nombre.")
        return rolename
    
class UpdateRoleForm(forms.Form):
    rolename = forms.CharField(max_length=150)
    permissions = forms.ModelMultipleChoiceField(
        queryset=Permission.objects.all(),
        required=True
    )

    def __init__(self, *args, **kwargs):
        self.group_instance = kwargs.pop("instance", None)
        super().__init__(*args, **kwargs)

        if self.group_instance:
            self.fields['rolename'].initial = self.group_instance.name
            self.fields['permissions'].initial = self.group_instance.permissions.all()

    def clean_rolename(self):
        rolename = self.cleaned_data['rolename']
        qs = Group.objects.filter(name__iexact=rolename)
        if self.group_instance:
            qs = qs.exclude(pk=self.group_instance.pk)
        if qs.exists():
            raise forms.ValidationError("Ya existe un grupo con ese nombre.")
        return rolename