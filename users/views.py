from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate
from .forms import CustomUserCreationForm, CustomAuthenticationForm



def register_view(request):
    # classic registration view things
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user) #auto login after registration
            return redirect('dashboard') # NEEDS URL TO DIRECT TO AFTER REGISTRATION
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
            return redirect('dashboard')
    else:
        form = CustomAuthenticationForm()
    return render(request, 'users/login.html', {'form': form})



def logout_view(request):
    # youll never guess what this one does
    logout(request)
    return redirect('login')