from django.contrib import admin
from .models import Profile, ServiceType, Order

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone', 'created_at')
    search_fields = ('user__username', 'phone')

@admin.register(ServiceType)
class ServiceTypeAdmin(admin.ModelAdmin):
    list_display = ('category', 'name', 'price_per_hour', 'min_hours', 'is_active')
    list_filter = ('is_active', 'category')
    search_fields = ('name',)

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'client', 'service_type', 'status', 'booking_date', 'price', 'is_paid')
    list_filter = ('status', 'is_paid', 'service_type')
    search_fields = ('client__username', 'comment')
    date_hierarchy = 'booking_date'