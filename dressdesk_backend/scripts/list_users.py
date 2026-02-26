import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dressdesk_backend.settings')
django.setup()
from users.models import User

users = list(User.objects.values('id', 'username', 'email'))
print(users)
