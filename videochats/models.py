from django.db import models
from django.conf import settings # used to get the custom user model
import uuid # used to create room ID

class Room(models.Model):
    # room host links to a User, host may have special perms..?
    # settings.AUTH_USER_MODEL ---> links to our custom user instead of the default
    host= models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE, related_name='rooms')
    
    # room name
    name= models.CharField(max_length=16)

    # creates a super random ID for the url so nobody 
    # can just guess a URL and get into a room
    room_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)

    max_members = models.IntegerField(default=10)

    def __str__(self):
        return self.name

    '''
    To-Do:
    Member Count
    Active Time
    '''