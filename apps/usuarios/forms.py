from django import forms
from django.contrib.auth.models import Group, User
from django.utils.crypto import get_random_string

class AddUsuarioForm(forms.Form):
    nombre = forms.CharField(max_length=150)
    apellido = forms.CharField(max_length=150)
    email = forms.EmailField()
    grupo = forms.ModelChoiceField(queryset=Group.objects.all(), required=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.generated_password = get_random_string(10)

    def clean_email(self):
        email = self.cleaned_data.get("email")
        if User.objects.filter(email=email).exists():
            raise forms.ValidationError("Este correo ya está registrado.")
        return email

    def save(self):
        data = self.cleaned_data
        user = User.objects.create_user(
            username=data["email"],
            email=data["email"],
            password=self.generated_password,
            first_name=data["nombre"],
            last_name=data["apellido"],
            is_superuser=False,  # Forzado a False
            is_staff=True,
            is_active=True
        )
        user.groups.set([data["grupo"]])
        return user, self.generated_password