# -*- coding: utf-8 -*-

from django.urls import path, include  
from . import views

urlpatterns = [
    path('', views.home, name='home'),  # Только главная страница
    
    # =============================================
    # ВСЕ ОСТАЛЬНЫЕ МАРШРУТЫ ВРЕМЕННО ОТКЛЮЧЕНЫ
    # =============================================
    # path('services/', views.services_list, name='services'),
    # path('service/<int:pk>/', views.service_detail, name='service_detail'),
    # path('profile/', login_required(views.profile), name='profile'),
    # path('register/', views.register, name='register'),
    # path('login/', CustomLoginView.as_view(), name='login'),
    # path('cancel_order/<int:order_id>/', views.cancel_order, name='cancel_order'),
    # path('delete_account/', login_required(views.delete_account), name='delete_account'),
    # path('change_username/', change_username, name='change_username'),
]