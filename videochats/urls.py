from django.urls import path
from . import views

urlpatterns = [
    path('', views.lobby_view, name='lobby'),
    path('create/', views.create_room_view, name='create_room'),
    path('room/<uuid:room_id>/', views.room_view, name='room'),
]