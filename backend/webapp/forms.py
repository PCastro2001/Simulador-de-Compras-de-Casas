from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

from .models import Profile

class SignUpForm(UserCreationForm):
    salary = forms.IntegerField(min_value=0, label="Sueldo mensual")
    household_size = forms.IntegerField(
        min_value=1, initial=1, label="Número de personas en el hogar"
    )
    rent = forms.IntegerField(min_value=0, initial=0, label="Arriendo mensual")
    region = forms.CharField(max_length=100, required=False, label="Región")

    class Meta(UserCreationForm.Meta):
        model = User
        fields = (
            "username",
            "email",
            "password1",
            "password2",
            "salary",
            "household_size",
            "rent",
            "region",
        )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["username"].label = "Nombre de usuario"
        self.fields["email"].label = "Correo electrónico"
        self.fields["password1"].label = "Contraseña"
        self.fields["password2"].label = "Confirmar contraseña"

    def save(self, commit=True):
        user = super().save(commit)
        profile, _ = Profile.objects.get_or_create(user=user)
        profile.salary = self.cleaned_data["salary"]
        profile.household_size = self.cleaned_data["household_size"]
        profile.rent = self.cleaned_data["rent"]
        profile.region = self.cleaned_data["region"]
        if commit:
            profile.save()
        return user
