# coding=windows-1251
from django import forms
from .models import (
    Booking, User, 
    RecordingServiceParams, MixingServiceParams,
    InstrumentalServiceParams, LyricsServiceParams,
    FullSongServiceParams, Service
)
from django.contrib.auth.forms import UserCreationForm
from django.forms import DateInput, DateTimeInput
from django.core.exceptions import ValidationError
from django.core.exceptions import ValidationError
from django.contrib.auth import password_validation

class BookingForm(forms.ModelForm):
    class Meta:
        model = Booking
        fields = ['service_type', 'date', 'notes']
        widgets = {
            'date': DateInput(attrs={'type': 'date'}),
            'notes': forms.Textarea(attrs={'rows': 3}),
        }

class RegisterForm(UserCreationForm):
    email = forms.EmailField(required=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2']

class RecordingServiceForm(forms.ModelForm):
    datetime = forms.DateTimeField(
        widget=DateTimeInput(attrs={'type': 'datetime-local'}),
        label="Дата и время записи"
    )
    
    class Meta:
        model = RecordingServiceParams
        fields = ['recording_type', 'hours', 'unknown_hours', 'sound_engineer', 'datetime']
        widgets = {
            'hours': forms.NumberInput(attrs={'min': 1, 'max': 7}),
        }

class MixingServiceForm(forms.ModelForm):
    deadline = forms.DateTimeField(
        widget=DateTimeInput(attrs={'type': 'datetime-local'}),
        label="Дедлайн"
    )
    
    class Meta:
        model = MixingServiceParams
        fields = ['zip_file', 'references', 'express', 'mastering', 'deadline']
        labels = {
            'zip_file': "ZIP-архив с треками",
            'references': "Референс-треки",
            'express': "Экспресс-сведение (700р)",
            'mastering': "Включить мастеринг (+500р)",
        }

class InstrumentalServiceForm(forms.ModelForm):
    deadline = forms.DateTimeField(
        widget=DateTimeInput(attrs={'type': 'datetime-local'}),
        label="Дедлайн"
    )
    
    class Meta:
        model = InstrumentalServiceParams
        fields = ['references', 'remake_beat', 'deadline']
        labels = {
            'remake_beat': "Нужен ремейк бита",
        }

class LyricsServiceForm(forms.ModelForm):
    deadline = forms.DateTimeField(
        widget=DateTimeInput(attrs={'type': 'datetime-local'}),
        label="Дедлайн"
    )
    
    class Meta:
        model = LyricsServiceParams
        fields = ['references', 'deadline']

class FullSongServiceForm(forms.ModelForm):
    deadline = forms.DateTimeField(
        widget=DateTimeInput(attrs={'type': 'datetime-local'}),
        label="Дедлайн"
    )
    
    class Meta:
        model = FullSongServiceParams
        fields = ['references', 'deadline']

class CreateServiceForm(forms.ModelForm):
    class Meta:
        model = Service
        fields = ['comment']
        widgets = {
            'comment': forms.Textarea(attrs={'rows': 3}),
        }
class ChangeUsernameForm(forms.Form):
    new_username = forms.CharField(
        label="Новый логин",
        max_length=150,
        widget=forms.TextInput(attrs={'class': 'form-control'}))
    
    current_password = forms.CharField(
        label="Текущий пароль",
        widget=forms.PasswordInput(attrs={'class': 'form-control'}))
    
    def __init__(self, user, *args, **kwargs):
        self.user = user
        super().__init__(*args, **kwargs)
    
    def clean_new_username(self):
        new_username = self.cleaned_data['new_username']
        if User.objects.filter(username=new_username).exclude(pk=self.user.pk).exists():
            raise ValidationError("Этот логин уже занят.")
        return new_username
    
    def clean_current_password(self):
        current_password = self.cleaned_data['current_password']
        if not self.user.check_password(current_password):
            raise ValidationError("Неверный пароль.")
        return current_password