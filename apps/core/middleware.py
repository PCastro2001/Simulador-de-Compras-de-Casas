import uuid
from .models import Visitante

class IdentificarVisitanteMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if not request.session.get('visitor_id'):
            visitor_id = str(uuid.uuid4())
            request.session['visitor_id'] = visitor_id

            # Obtener IP
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            ip = x_forwarded_for.split(',')[0] if x_forwarded_for else request.META.get('REMOTE_ADDR')

            # Guardar en base de datos
            Visitante.objects.create(
                visitor_id=visitor_id,
                ip_address=ip,
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )

        return self.get_response(request)
