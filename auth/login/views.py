from django.shortcuts import redirect
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.contrib import messages
from auth.views import AuthView

class LoginView(AuthView):
    
    def get(self, request):
        if request.user.is_authenticated:
            return redirect("index")

        return super().get(request)
    
    def post(self, request):
        if request.method == "POST":
            username = request.POST.get("email-username")
            password = request.POST.get("password")

            if not (username and password):
                messages.error(request, "Porfavor ingrese usuario y contraseña" )
                return redirect("login")
             
            if "@" in username:
                user_email = User.objects.filter(email=username).first()
                
                if user_email is None:
                    messages.error(request, "Favor ingrese un email Valido")
                    return redirect("login")
                username = user_email.username
            
            user_email = User.objects.filter(username=username).first()
            if user_email is None:
                messages.error(request, "Porfavor ingresa un usuario valido")
                return redirect("login")
            
            authenticated_user = authenticate(request, username=username, password=password)
            if authenticated_user is not None:
                login(request, authenticated_user)

                if "next" in request.POST:
                    return redirect(request.POST["next"])
                else:
                    return redirect("admin-home")
                
            else:
                messages.error(request, "Porfavor ingrese un username valido")
                return redirect("login")