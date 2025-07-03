from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.views.generic import TemplateView

from .forms import SignUpForm

class HomeView(TemplateView):
    template_name = 'index.html'


def page(request, template):
    return render(request, f'pages/{template}')


def signup(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('dashboard')
    else:
        form = SignUpForm()
    return render(request, 'signup.html', {'form': form})


@login_required
def dashboard(request):
    profile = request.user.profile
    adjusted_income = (profile.salary - profile.rent) / profile.household_size
    thresholds = [
        (69518, 10),
        (109984, 20),
        (145631, 30),
        (181532, 40),
        (221249, 50),
        (278403, 60),
        (353729, 70),
        (476523, 80),
        (774525, 90),
        (float('inf'), 100),
    ]
    percentile = next(p for m, p in thresholds if adjusted_income < m)

    subsidies = []
    if percentile <= 40:
        subsidies.append({'href': 'pages/percentile/ds49.html', 'title': 'Subsidio DS49'})
    if percentile <= 60:
        subsidies.append({'href': 'pages/percentile/ds1t1.html', 'title': 'Subsidio DS1 Tramo 1'})
    if percentile <= 70:
        subsidies.append({'href': 'pages/percentile/ds1t2.html', 'title': 'Subsidio DS1 Tramo 2'})
    if percentile <= 100:
        subsidies.append({'href': 'pages/percentile/ds1t3.html', 'title': 'Subsidio DS1 Tramo 3'})

    context = {
        'profile': profile,
        'percentile': percentile,
        'subsidies': subsidies,
    }
    return render(request, 'dashboard.html', context)
