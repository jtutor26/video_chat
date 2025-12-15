from django import forms
from .models import Room

class RoomForm(forms.ModelForm):
    class Meta:
        model = Room
        fields = ['name', 'passcode', 'max_members']
        
        widgets = {
            'name': forms.TextInput(attrs={'placeholder': 'Enter room name'}),
        }