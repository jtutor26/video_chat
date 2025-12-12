from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from .models import Room

# Create your views here.
@login_required
def lobby_view(request):
    return render(request, 'videochats/lobby.html', {'rooms':Room.objects.all()})

@login_required
def create_room_view(request):
    return redirect('lobby')

@login_required
def room_view(request, room_id):
    try:
        room = Room.objects.get(room_id=room_id)
    except Room.DoesNotExist:
        return redirect('lobby')
    return render(request, 'videochats/room.html', {'room': room,})