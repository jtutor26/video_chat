from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from .models import Room
from .forms import RoomForm
from django.contrib import messages

# Create your views here.
@login_required
def lobby_view(request):
    return render(request, 'videochats/lobby.html', {'rooms':Room.objects.all()})

@login_required
def create_room_view(request):
    if request.method == 'POST':
        form = RoomForm(request.POST)
        if form.is_valid():
            # we save the form but dont commit to the DB so we can add the host, 
            # and THEN add it to the DB
            room = form.save(commit=False)
            room.host = request.user
            room.save()
            return redirect('room', room_id=room.room_id)
    else:
        form = RoomForm()
    
    return render(request, 'videochats/create_room.html', {'form': form})
@login_required
def room_view(request, room_id):
    try:
        room = Room.objects.get(room_id=room_id)
    except Room.DoesNotExist:
        return redirect('lobby')
    
    # Check if the room has a passcode
    # We skip this check if the current user is the host of the room
    if room.passcode is not None and request.user != room.host:
        entered_passcode = request.GET.get('passcode')
        
        # Verify the passcode (convert room.passcode to string for comparison)
        if entered_passcode != str(room.passcode):
            messages.error(request, 'Invalid passcode provided for this room.')
            return redirect('lobby')

    return render(request, 'videochats/room.html', {'room': room,})