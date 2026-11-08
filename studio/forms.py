# coding=windows-1251
from django import forms
from .models import (
     User, 
    
)
from django.contrib.auth.forms import UserCreationForm
from django.forms import DateInput, DateTimeInput
from django.core.exceptions import ValidationError
from django.core.exceptions import ValidationError
from django.contrib.auth import password_validation


class RegisterForm(UserCreationForm):
    email = forms.EmailField(required=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2']

    
    


class ChangeUsernameForm(forms.Form):
    new_username = forms.CharField(
        label="����� �����",
        max_length=150,
        widget=forms.TextInput(attrs={'class': 'form-control'}))
    
    current_password = forms.CharField(
        label="������� ������",
        widget=forms.PasswordInput(attrs={'class': 'form-control'}))
    
    def __init__(self, user, *args, **kwargs):
        self.user = user
        super().__init__(*args, **kwargs)
    
    def clean_new_username(self):
        new_username = self.cleaned_data['new_username']
        if User.objects.filter(username=new_username).exclude(pk=self.user.pk).exists():
            raise ValidationError("���� ����� ��� �����.")
        return new_username
    
    def clean_current_password(self):
        current_password = self.cleaned_data['current_password']
        if not self.user.check_password(current_password):
            raise ValidationError("�������� ������.")
        return current_password