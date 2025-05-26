# -*- coding: utf-8 -*-

from django.urls import path, include  
from . import views
from django.contrib.auth.decorators import login_required
from .views import CustomLoginView

urlpatterns = [
    path('', views.home, name='home'),                     
    path('services/', views.services_list, name='services'),
    path('service/<int:pk>/', views.service_detail, name='service_detail'),
    path('profile/', login_required(views.profile), name='profile'),
    path('register/', views.register, name='register'),
    path('login/', CustomLoginView.as_view(), name='login'),

    path('service/<int:pk>/', views.service_detail, name='service_detail'),
    path('cancel_order/<int:order_id>/', views.cancel_order, name='cancel_order'),


]

