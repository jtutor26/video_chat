from django.urls import path
from . import views

urlpatterns = [
    path('lobby/', views.lobby_view, name='lobby'),
    path('create/', views.create_room_view, name='create_room'),
    path('room/<uuid:room_id>/', views.room_view, name='room'),
    path('room/<uuid:room_id>/start/', views.start_game, name='start_game'),
    path('room/<uuid:room_id>/guess/', views.make_guess, name='make_guess'),
    path('room/<uuid:room_id>/state/', views.get_game_state, name='get_game_state'),
]