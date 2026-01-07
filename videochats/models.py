from django.db import models
from django.conf import settings # used to get the custom user model
import uuid # used to create room ID
import random # used to pick a random word

class Room(models.Model):
    # room host links to a User, host may have special perms..?
    # settings.AUTH_USER_MODEL ---> links to our custom user instead of the default
    host= models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE, related_name='rooms')
    
    # room name
    name= models.CharField(max_length=16)

    # creates a super random ID for the url so nobody 
    # can just guess a URL and get into a room
    room_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)

    passcode = models.PositiveIntegerField(default=None, null=True)
    max_members = models.IntegerField(default=10)

    # these are related to the actual game
    # were tracking if the game is active, who is acting, and what word they're acting
    is_game_active = models.BooleanField(default=False)
    current_actor = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, related_name='acting_in', on_delete=models.SET_NULL)
    current_word = models.CharField(max_length=100, blank=True, null=True)
    def __str__(self):
        return self.name
    
    # helper function that pics a new word
    def pick_new_word(self):
        # !!!!! WE NEED TO ADD WORDS HERE, AN API WOULD BE COOL !!!!!
        words = ['Apple', 'Elephant', 'Guitar', 'Spiderman', 'Swimming', 'Pizza']
        self.current_word = random.choice(words)
        self.save()
