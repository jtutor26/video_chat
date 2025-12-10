from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from .models import CustomUser

class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = CustomUser
        # fields the user will fill out when creating an account
        fields = ('email', 'first_name', 'last_name')

class CustomAuthenticationForm(AuthenticationForm):
    # We override the default 'username' field to look like an Email field
    username = forms.CharField(
        label='Email', 
        widget=forms.EmailInput(attrs={'class': 'form-control', 'autocomplete': 'email'})
    )