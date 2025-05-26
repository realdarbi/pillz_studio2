from django.contrib import admin
from django.urls import reverse
from django.utils.html import format_html
from django.http import HttpResponse
from django.db.models import Count, Sum, Q
from django.shortcuts import render
from django.contrib.admin import AdminSite
import csv
from datetime import datetime, timedelta
from .models import (
    Profile, ServiceType, Service, 
    Portfolio, Booking, Review,
    RecordingServiceParams, MixingServiceParams,
    InstrumentalServiceParams, LyricsServiceParams,
    FullSongServiceParams
)
from django.db import models
from django.utils import timezone
# ====================== КАСТОМНЫЕ АДМИН-ДЕЙСТВИЯ ======================

def export_to_csv(modeladmin, request, queryset):
    """Экспорт выбранных записей в CSV"""
    model = modeladmin.model
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="{model._meta.verbose_name_plural}.csv"'
    
    writer = csv.writer(response)
    
    # Заголовки
    headers = [field.name for field in model._meta.fields]
    writer.writerow(headers)
    
    # Данные
    for obj in queryset:
        row = [getattr(obj, field) for field in headers]
        writer.writerow(row)
    
    return response
export_to_csv.short_description = "Экспорт в CSV"

def mark_as_confirmed(modeladmin, request, queryset):
    """Массовое подтверждение услуг"""
    queryset.update(status='confirmed', date_confirmed=datetime.now())
mark_as_confirmed.short_description = "Подтвердить выбранные"

# ====================== КАСТОМНЫЕ ФИЛЬТРЫ ======================

class ServiceStatusFilter(admin.SimpleListFilter):
    """Фильтр для статусов услуг с группировкой"""
    title = 'Группировка статусов'
    parameter_name = 'status_group'

    def lookups(self, request, model_admin):
        return (
            ('active', 'Активные (подтверждённые/в работе)'),
            ('completed', 'Завершённые'),
            ('pending', 'Ожидающие'),
        )

    def queryset(self, request, queryset):
        if self.value() == 'active':
            return queryset.filter(Q(status='confirmed') | Q(status='in_progress'))
        if self.value() == 'completed':
            return queryset.filter(status='completed')
        if self.value() == 'pending':
            return queryset.filter(status='pending')

# ====================== КАСТОМНЫЕ ModelAdmin КЛАССЫ ======================

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone', 'avatar_preview', 'bio_short')
    search_fields = ('user__username', 'phone')
    list_select_related = ('user',)
    readonly_fields = ('avatar_preview',)

    def bio_short(self, obj):
        return obj.bio[:50] + '...' if obj.bio else '-'
    bio_short.short_description = 'Био'

    def avatar_preview(self, obj):
        if obj.avatar:
            return format_html('<img src="{}" width="50" style="border-radius: 50%;" />', obj.avatar.url)
        return "-"
    avatar_preview.short_description = 'Аватар'

@admin.register(ServiceType)
class ServiceTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'min_price', 'duration', 'active_services_count', 'is_active')
    list_filter = ('category', 'is_active')
    search_fields = ('name', 'description')
    actions = [export_to_csv]

    def active_services_count(self, obj):
        return obj.service_set.filter(status__in=['confirmed', 'in_progress']).count()
    active_services_count.short_description = 'Активных заказов'

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'client', 'service_type', 'status_badge', 
        'price', 'date_ordered', 'service_details_link'
    )
    list_filter = (ServiceStatusFilter, 'service_type', 'date_ordered')
    search_fields = ('client__username', 'service_type__name', 'comment')
    date_hierarchy = 'date_ordered'
    list_editable = ('price',)
    actions = [export_to_csv, mark_as_confirmed]
    list_select_related = ('client', 'service_type')

    def status_badge(self, obj):
        colors = {
            'pending': 'orange',
            'confirmed': 'blue',
            'in_progress': 'green',
            'completed': 'gray',
            'canceled': 'red'
        }
        return format_html(
            '<span style="background: {}; color: white; padding: 3px 8px; border-radius: 10px;">{}</span>',
            colors.get(obj.status, 'black'),
            obj.get_status_display()
        )
    status_badge.short_description = 'Статус'
    status_badge.admin_order_field = 'status'

    def service_details_link(self, obj):
        links = []
        if hasattr(obj, 'recording_params'):
            url = reverse('admin:studio_recordingserviceparams_change', args=[obj.recording_params.id])
            links.append(f'<a href="{url}">Параметры записи</a>')
        if hasattr(obj, 'mixing_params'):
            url = reverse('admin:studio_mixingserviceparams_change', args=[obj.mixing_params.id])
            links.append(f'<a href="{url}">Параметры сведения</a>')
        return format_html(' | '.join(links)) if links else "-"
    service_details_link.short_description = "Детали услуги"

# Параметры услуг (общий стиль)
class ServiceParamsAdmin(admin.ModelAdmin):
    list_display = ('service', 'deadline', 'is_overdue')
    date_hierarchy = 'deadline'
    list_filter = ('deadline',)

    def is_overdue(self, obj):
        if obj.deadline:
            now = timezone.now()
            if timezone.is_naive(obj.deadline):
                # Если deadline naive, делаем его aware (предполагая UTC)
                deadline = timezone.make_aware(obj.deadline)
            else:
                deadline = obj.deadline
            return format_html('<span style="color: red;">⚠ Просрочено</span>') if deadline < now else "-"
        return "-"


@admin.register(RecordingServiceParams)
class RecordingServiceParamsAdmin(admin.ModelAdmin):
    list_display = ('service', 'recording_type', 'hours', 'sound_engineer', 'datetime', 'is_overdue')
    list_filter = ('recording_type', 'sound_engineer', 'datetime')
    search_fields = ('service__client__username',)
    date_hierarchy = 'datetime'
    
    def is_overdue(self, obj):
        if obj.datetime:
            now = timezone.now()
            if timezone.is_naive(obj.datetime):
                # Если datetime naive, делаем его aware (предполагая UTC)
                datetime_aware = timezone.make_aware(obj.datetime)
            else:
                datetime_aware = obj.datetime
            return format_html('<span style="color: red;">⚠ Просрочено</span>') if datetime_aware < now else "-"
        return "-"
@admin.register(MixingServiceParams)
class MixingServiceParamsAdmin(ServiceParamsAdmin):
    list_display = ServiceParamsAdmin.list_display + ('express', 'mastering')

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('client', 'service_type', 'date', 'is_confirmed', 'time_until_booking')
    list_filter = ('is_confirmed', 'service_type', 'date')
    search_fields = ('client__username', 'notes')
    date_hierarchy = 'date'
    actions = [export_to_csv]

    def time_until_booking(self, obj):
        if obj.date > datetime.now():
            delta = obj.date - datetime.now()
            return f"Через {delta.days} дней"
        return "Прошло"
    time_until_booking.short_description = "До записи"

# ====================== КАСТОМНАЯ АДМИН-ПАНЕЛЬ С ДАШБОРДОМ ======================

class StudioAdminSite(AdminSite):
    site_header = "Панель управления студией"
    site_title = "Pillz Studio Admin"
    index_title = "Главная"

    def get_urls(self):
        from django.urls import path
        urls = super().get_urls()
        custom_urls = [
            path('studio-stats/', self.admin_view(self.studio_stats), name='studio-stats'),
        ]
        return custom_urls + urls

    def studio_stats(self, request):
        # Статистика услуг
        services_stats = (
            Service.objects.values('service_type__name', 'status')
            .annotate(count=Count('id'), total=Sum('price'))
            .order_by('service_type__name')
        )

        # Последние 5 заказов
        recent_orders = Service.objects.select_related('client', 'service_type').order_by('-date_ordered')[:5]

        context = {
            'services_stats': services_stats,
            'recent_orders': recent_orders,
            'total_income': Service.objects.aggregate(Sum('price'))['price__sum'],
            'active_bookings': Booking.objects.filter(date__gte=datetime.now()).count(),
        }
        return render(request, 'admin/studio_stats.html', context)

@admin.register(Portfolio)
class PortfolioAdmin(admin.ModelAdmin):
    list_display = ('title', 'service_type', 'audio_preview', 'created_at')
    search_fields = ('title', 'description')
    list_filter = ('service_type', 'created_at')
    date_hierarchy = 'created_at'
    readonly_fields = ('audio_preview',)

    def audio_preview(self, obj):
        if obj.audio_file:
            return format_html(
                '<div style="margin-top: 10px;">'
                '<audio controls style="height: 30px; width: 200px;">'
                '<source src="{}" type="audio/mpeg">'
                'Ваш браузер не поддерживает аудио.'
                '</audio>'
                '<div><small>{}</small></div>'
                '</div>',
                obj.audio_file.url,
                obj.audio_file.name
            )
        return "—"
    audio_preview.short_description = "Прослушать"

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('author', 'service', 'rating', 'short_text', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('author__username', 'text', 'service__service_type__name')
    date_hierarchy = 'created_at'
    list_select_related = ('author', 'service__service_type')

    def short_text(self, obj):
        return obj.text[:50] + '...' if len(obj.text) > 50 else obj.text
    short_text.short_description = "Текст отзыва"


# Регистрация кастомной админки
studio_admin = StudioAdminSite(name='studio_admin')

# Перерегистрация всех моделей
studio_admin.register(Profile, ProfileAdmin)
studio_admin.register(ServiceType, ServiceTypeAdmin)
studio_admin.register(Service, ServiceAdmin)
studio_admin.register(RecordingServiceParams, RecordingServiceParamsAdmin)
studio_admin.register(MixingServiceParams, MixingServiceParamsAdmin)
@admin.register(InstrumentalServiceParams)
class InstrumentalServiceParamsAdmin(ServiceParamsAdmin):
    list_display = ServiceParamsAdmin.list_display + ('remake_beat',)
    list_filter = ServiceParamsAdmin.list_filter + ('remake_beat',)

@admin.register(LyricsServiceParams)
class LyricsServiceParamsAdmin(ServiceParamsAdmin):
    pass

@admin.register(FullSongServiceParams)
class FullSongServiceParamsAdmin(ServiceParamsAdmin):
    pass
studio_admin.register(Portfolio, PortfolioAdmin)
studio_admin.register(Booking, BookingAdmin)
studio_admin.register(Review, ReviewAdmin)