from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from .models import CustomUser

# Register Form
class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = CustomUser
        # fields the user will fill out when creating an account
        fields = ('email', 'first_name', 'last_name')

# Login Form
class CustomAuthenticationForm(AuthenticationForm):
    # We override the default 'username' field to look like an Email field
    username = forms.CharField(
        label='Email', 
        widget=forms.EmailInput(attrs={'class': 'form-control', 'autocomplete': 'email'})
    )

# Update Form
class UserUpdateForm(forms.ModelForm):
    class Meta:
        model = CustomUser
        fields = ('first_name', 'last_name', 'email')
    
    def __init__(self, *args, **kwargs):
        super(UserUpdateForm, self).__init__(*args, **kwargs)
        for field in self.fields:
            self.fields[field].widget.attrs.update({'class': 'form-control'})