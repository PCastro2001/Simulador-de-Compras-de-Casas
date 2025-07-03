from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

from .models import Profile

class SignUpForm(UserCreationForm):
    salary = forms.IntegerField(min_value=0)
    household_size = forms.IntegerField(min_value=1, initial=1)
    rent = forms.IntegerField(min_value=0, initial=0)
    region = forms.CharField(max_length=100, required=False)

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
