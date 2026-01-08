from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from .models import Room
from .forms import RoomForm
from django.contrib import messages
from django.http import JsonResponse
import json
from users.models import CustomUser
import random

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
    if room.passcode is not None and request.user != room.host and not request.user.is_admin:
        entered_passcode = request.GET.get('passcode')
        
        # Verify the passcode (convert room.passcode to string for comparison)
        if entered_passcode != str(room.passcode):
            messages.error(request, 'Invalid passcode provided for this room.')
            return redirect('lobby')

    return render(request, 'videochats/room.html', {'room': room,})

# Used to get the name for the video boxes in the rooms
@login_required
def get_first_name(request):
    uid = request.GET.get('uid')
    try:
        user = CustomUser.objects.get(id=uid)
        # Explicitly return the first_name
        return JsonResponse({'name': user.first_name})
    except CustomUser.DoesNotExist:
        return JsonResponse({'name': "Unknown"})


# CHARADES RELATED FUNCTIONS
@login_required
def start_game(request, room_id):
    room = Room.objects.get(room_id=room_id)
    # This is where we check if the current user is the host
    if request.user == room.host:
        room.is_game_active = True
        room.current_actor = request.user # Host starts as actor
        room.pick_new_word()
        room.save()
    return JsonResponse({'status': 'started'})

@login_required
def make_guess(request, room_id):
    if request.method == 'POST':
        data = json.loads(request.body)
        guess = data.get('guess', '').strip().lower()
        room = Room.objects.get(room_id=room_id)
        # Check if guess is correct
        if guess == room.current_word.lower(): 
            last_actor = room.current_actor
            
            # 1. Clear the game mode in the DB so it doesn't re-apply to the new actor
            room.current_mode = "" 

            room.current_actor = request.user 
            room.pick_new_word()
            room.save()
            
            # 2. Send last_actor.id (the number) instead of the whole object
            return JsonResponse({
                'correct': True, 
                'winner': request.user.first_name, 
                'last_actor': last_actor.id if last_actor else None
            })
            
    return JsonResponse({'correct': False})

@login_required
def get_game_state(request, room_id):
    room = Room.objects.get(room_id=room_id)
    
    word_to_show = "???"
    if request.user == room.current_actor:
        word_to_show = room.current_word
    
    return JsonResponse({
        'is_active': room.is_game_active,
        'actor_name': room.current_actor.first_name if room.current_actor else "None",
        'actor_id': room.current_actor.id if room.current_actor else None,
        'word': word_to_show,
        'current_user_id': request.user.id,
        'game_mode': room.current_mode,
    })

@login_required
def delete_room(request, room_id):
    try:
        room = Room.objects.get(room_id=room_id)
        # Only delete if the user is the host
        if request.user == room.host or request.user.is_admin:
            room.delete()
            return JsonResponse({'status': 'deleted'})
    except Room.DoesNotExist:
        pass # Room might already be gone, which is fine
    return JsonResponse({'status': 'ok'})

def update_gamemode(request, room_id):
    GAMEMODES = ["blinking-screen", "black-and-white", "short-time", "on-and-off-cam", "reverse", ""]
    new_gamemode = GAMEMODES[random.randint(0,5)]
    room = Room.objects.get(room_id=room_id)
    room.current_mode = new_gamemode
    room.save()
    return JsonResponse({'current_mode': new_gamemode})
    