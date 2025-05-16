# Views y config
from django.conf import settings
from auth.views import AuthView

# Contrib
from django.contrib import messages
from django.shortcuts import redirect
import uuid

# Modelos
from django.contrib.auth.models import User, Group

class RegisterView(AuthView):

    def get(self, request):
        if request.user.is_authenticated:
            return redirect("home-admin")
        
        return super().get(request) # redericciona al login 

    def post(self, request):
        username = request.POST.get("username")
        email = request.POST.get("email")
        password = request.POST.get("password")

        # Validaciones
        if User.objects.filter(username=username, email=email).exists():
            messages.error(request, "Usuario ya existe, intente con otro usuario")
            return redirect("register")
        
        elif User.objects.filter(email=email).exists():
            messages.error(request, "Email ya existe")
            return redirect("register")
        
        elif User.objects.filter(username=username).exists():
            messages.error(request, "Username ya existe")
            return redirect("register")
        
        created_user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )

        created_user.save()

        user_group, created = Group.objects.get_or_create(name="Cliente")
        created_user.groups.add(user_group)