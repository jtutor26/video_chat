from django import forms
from .models import Room

class RoomForm(forms.ModelForm):
    class Meta:
        model = Room
        fields = ['name', 'passcode', 'max_members', 'game_mode']
        
        widgets = {
            'name': forms.TextInput(attrs={'placeholder': 'Enter room name'}),
            'game_mode': forms.Select(choices=Room.GAME_MODES),
        }