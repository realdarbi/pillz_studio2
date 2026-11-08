from django.contrib.auth.models import User
from django.db import models


class Profile(models.Model):
    """Дополнительные данные пользователя. Телефон используется для авторизации."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField('Номер телефона', max_length=20, unique=True)
    created_at = models.DateTimeField('Дата регистрации', auto_now_add=True)

    class Meta:
        verbose_name = 'Профиль'
        verbose_name_plural = 'Профили'

    def __str__(self):
        return f"{self.user.username} ({self.phone})"


class ServiceType(models.Model):
    """Три конкретные услуги: Pillz со звукарем, Space со звукарем, Space без звукаря."""
    
    CATEGORY_CHOICES = [
        ('pillz_with_engineer', 'Pillz Studio — запись со звукорежиссёром'),
        ('space_with_engineer', 'Space Pillz — запись со звукорежиссёром'),
        ('space_without_engineer', 'Space Pillz — запись без звукорежиссёра'),
    ]

    category = models.CharField(
        'Категория услуги', 
        max_length=50, 
        choices=CATEGORY_CHOICES, 
        unique=True
    )
    name = models.CharField('Название на сайте', max_length=255)
    description = models.TextField('Описание', blank=True)
    price_per_hour = models.DecimalField('Цена за час', max_digits=10, decimal_places=2)
    min_hours = models.PositiveIntegerField('Минимальное количество часов', default=1)
    is_active = models.BooleanField('Активна', default=True)

    class Meta:
        verbose_name = 'Тип услуги'
        verbose_name_plural = 'Типы услуг'

    def __str__(self):
        return self.get_category_display()


class Order(models.Model):
    """Заказ на запись или аренду студии."""

    STATUS_CHOICES = [
        ('pending', 'В ожидании подтверждения'),
        ('confirmed', 'Подтверждено'),
        ('canceled', 'Отменено'),
        ('completed', 'Выполнено'),
    ]

    client = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='orders', 
        verbose_name='Клиент'
    )
    service_type = models.ForeignKey(
        ServiceType, 
        on_delete=models.PROTECT, 
        related_name='orders', 
        verbose_name='Услуга'
    )
    status = models.CharField(
        'Статус', 
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='pending'
    )

    booking_date = models.DateField('Дата записи')
    booking_time_start = models.TimeField('Время начала')
    booking_time_end = models.TimeField('Время окончания')
    duration_hours = models.PositiveIntegerField('Длительность (часов)', default=1)

    comment = models.TextField('Комментарий клиента', blank=True)

    price = models.DecimalField('Итоговая цена', max_digits=10, decimal_places=2)
    is_paid = models.BooleanField('Оплачено', default=False)
    paid_at = models.DateTimeField('Дата оплаты', blank=True, null=True)

    created_at = models.DateTimeField('Создан', auto_now_add=True)
    updated_at = models.DateTimeField('Обновлён', auto_now=True)

    class Meta:
        verbose_name = 'Заказ'
        verbose_name_plural = 'Заказы'
        ordering = ['-created_at']

    def __str__(self):
        return f"Заказ #{self.pk} — {self.service_type} ({self.get_status_display()})"