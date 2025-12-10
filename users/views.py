from django.shortcuts import render, redirect
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .forms import CustomUserCreationForm, CustomAuthenticationForm, UserUpdateForm



def register_view(request):
    # classic registration view things
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user) #auto login after registration
            return redirect('profile') # CHANGE TO REDIRECT TO A HOMEPAGE
    else:
        form = CustomUserCreationForm()
    return render(request, 'users/register.html', {'form': form})



def login_view(request):
    # classic login view things
    if request.method == 'POST':
        form = CustomAuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            return redirect('profile') # CHANGE TO REDIRECT TO A HOMEPAGE
    else:
        form = CustomAuthenticationForm()
    return render(request, 'users/login.html', {'form': form})



def logout_view(request):
    # youll never guess what this one does
    logout(request)
    return redirect('login')


@login_required
def profile_view(request):
    if request.method == 'POST':
        form = UserUpdateForm(request.POST, request.FILES, instance=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, 'Your profile has been updated!')
            return redirect('profile') 
    else:
        # Pre-fill the form with the current user's data
        form = UserUpdateForm(instance=request.user)
    
    return render(request, 'users/profile.html', {'form': form})