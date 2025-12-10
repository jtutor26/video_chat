from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse

# We use get_user_model() to reference our CustomUser safely
User = get_user_model()

class UsersManagersTests(TestCase):
    """ Test that the Custom User Model works as expected """
    
    def test_create_user(self):
        # 1. Create a user
        user = User.objects.create_user(email='normal@user.com', password='foo') # type: ignore
        
        # 2. Check if the values are correct
        self.assertEqual(user.email, 'normal@user.com')
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)

        # 3. Check if we can log in with this email
        # The username field internally should now return the email
        self.assertEqual(user.get_username(), 'normal@user.com')

    def test_create_superuser(self):
        # 1. Create a superuser
        admin_user = User.objects.create_superuser(email='super@user.com', password='foo') # type: ignore
        
        # 2. Check permissions
        self.assertTrue(admin_user.is_active)
        self.assertTrue(admin_user.is_staff)
        self.assertTrue(admin_user.is_superuser)

    def test_create_user_without_email(self):
        # 1. Ensure creating a user with NO email raises an error
        with self.assertRaises(ValueError):
            User.objects.create_user(email='', password='foo') # type: ignore

class ProfileViewTests(TestCase):
    """ Test the views and access control """

    def setUp(self):
        # This runs before EVERY test function below
        self.user = User.objects.create_user(
            email='test@test.com', 
            password='testpassword123', 
            first_name='John', 
            last_name='Doe'
        ) # type: ignore

    def test_profile_view_redirects_anonymous(self):
        # 1. Try to access profile WITHOUT logging in
        response = self.client.get(reverse('profile'))
        
        # 2. Should redirect (302) to login page
        self.assertEqual(response.status_code, 302)
        # Check if it redirects to the login page
        self.assertIn('/accounts/login/?next=/profile/', response.url) # type: ignore

    def test_profile_view_accessible_authenticated(self):
        # 1. Log the user in
        self.client.login(email='test@test.com', password='testpassword123')
        
        # 2. Try to access profile
        response = self.client.get(reverse('profile'))
        
        # 3. Should succeed (200)
        self.assertEqual(response.status_code, 200)
        # Check if the user's name is on the page
        self.assertContains(response, 'John')