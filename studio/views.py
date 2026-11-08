# -*- coding: utf-8 -*-
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.contrib.auth import login, logout
from django.urls import reverse
from django.contrib import messages
from django.http import JsonResponse
from django.template.loader import render_to_string
from django.contrib.auth.views import LoginView
from django.utils.http import url_has_allowed_host_and_scheme
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_protect
import logging

from .models import ServiceType, Profile, Order
from .forms import RegisterForm, ChangeUsernameForm

logger = logging.getLogger(__name__)

def is_ajax(request):
    return request.headers.get('X-Requested-With') == 'XMLHttpRequest'

class CustomLoginView(LoginView):
    template_name = 'studio/login.html'
    
    def get(self, request, *args, **kwargs):
        if is_ajax(request):
            try:
                context = self.get_context_data()
                context['is_ajax'] = True
                html = render_to_string(
                    'studio/login_form.html', 
                    context, 
                    request=request,
                    using='django'
                )
                return JsonResponse(
                    {'html': html},
                    content_type='application/json; charset=utf-8'
                )
            except Exception as e:
                logger.error(f"Error rendering login form: {str(e)}")
                return JsonResponse(
                    {'error': str(e)},
                    status=500,
                    content_type='application/json; charset=utf-8'
                )
        return super().get(request, *args, **kwargs)
    
    def form_valid(self, form):
        if is_ajax(self.request):
            login(self.request, form.get_user())
            return JsonResponse({
                'success': True,
                'redirect_url': self.get_success_url(), 
                'user_authenticated': True,
                'message': 'Вы успешно вошли в систему'
            }, content_type='application/json; charset=utf-8')
        return super().form_valid(form)
    
    def form_invalid(self, form):
        error_message = 'Неверный логин или пароль'
        if is_ajax(self.request):
            try:
                return JsonResponse({
                    'success': False,
                    'error': error_message, 
                    'errors': form.errors.get_json_data()
                }, status=400, content_type='application/json; charset=utf-8')
            except Exception as e:
                logger.error(f"Error rendering invalid login form: {str(e)}")
                return JsonResponse({
                    'success': False,
                    'error': 'Ошибка формы'
                }, status=500, content_type='application/json; charset=utf-8')
        
        messages.error(self.request, error_message)
        return super().form_invalid(form)
    
    def get_success_url(self):
        redirect_to = self.request.POST.get('next') or self.request.GET.get('next')
        if redirect_to and url_has_allowed_host_and_scheme(redirect_to, allowed_hosts=None):
            return redirect_to
        return super().get_success_url()


@csrf_protect
def register(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            try:
                user = form.save()
                Profile.objects.create(user=user)
                login(request, user)
                
                if is_ajax(request):
                    return JsonResponse({
                        'success': True,
                        'redirect_url': reverse('home')
                    })
                return redirect('home')
            except Exception as e:
                logger.error(f"Registration error: {str(e)}")
                if is_ajax(request):
                    return JsonResponse({
                        'success': False,
                        'html': render_to_string('studio/register_form.html', {'form': form}, request=request)
                    }, status=400)
                messages.error(request, f"Ошибка регистрации: {str(e)}")
        
        if is_ajax(request):
            return JsonResponse({
                'success': False,
                'html': render_to_string('studio/register_form.html', {'form': form}, request=request)
            }, status=400)
    
    form = RegisterForm()
    if is_ajax(request):
        return JsonResponse({
            'html': render_to_string('studio/register_form.html', {'form': form}, request=request)
        })
    
    return render(request, 'studio/register.html', {'form': form})


def custom_logout(request):
    logout(request)
    messages.success(request, "Вы успешно вышли из системы")
    return redirect(reverse('login'))


@login_required
def profile(request):
    # Временная заглушка, чтобы главная страница не падала из-за ссылок в шапке
    return render(request, 'studio/home.html', {'message': 'Профиль в разработке'})


@csrf_protect
def home(request):
    # Убрал старую сортировку (recording, mixing и т.д.), так как у нас теперь другие категории
    services = ServiceType.objects.filter(is_active=True)
    
    return render(request, 'studio/home.html', {
        'services': services,
        'title': 'Главная',
        'heading': 'Популярные услуги'
    })


@csrf_protect
def services_list(request):
    services = ServiceType.objects.filter(is_active=True)
    return render(request, 'studio/home.html', {
        'services': services,
        'title': 'Все услуги',
        'heading': 'Полный список услуг'
    })


@login_required
@require_POST
def change_username(request):
    form = ChangeUsernameForm(request.user, request.POST)
    
    if form.is_valid():
        try:
            new_username = form.cleaned_data['new_username']
            user = request.user
            user.username = new_username
            user.save()
            
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'status': 'success',
                    'message': 'Логин успешно изменен!',
                    'new_username': new_username
                })
            
            messages.success(request, 'Логин успешно изменен!')
            return redirect('profile')
        
        except Exception as e:
            logger.error(f"Error changing username: {str(e)}")
            error_msg = f"Ошибка при изменении логина: {str(e)}"
    else:
        error_msg = "Пожалуйста, исправьте ошибки в форме."
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return JsonResponse({
            'status': 'error',
            'message': error_msg,
            'errors': form.errors.get_json_data()
        }, status=400)
    
    messages.error(request, error_msg)
    return redirect('profile')