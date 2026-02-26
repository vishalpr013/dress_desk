from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models

class User(AbstractUser):
    USER_TYPE_CHOICES = (
        ('buyer', 'Buyer'),
        ('seller', 'Seller'),
        ('admin', 'Admin'),
    )
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES, default='buyer')

    # Fix reverse accessor clash
    groups = models.ManyToManyField(
        Group,
        related_name='custom_user_set',  # change this to any unique name
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name='custom_user_permissions_set',  # unique name
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )
