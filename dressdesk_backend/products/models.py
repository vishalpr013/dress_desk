from django.db import models
from django.db import models
from users.models import User
from django.db import models

class Product(models.Model):
    CATEGORY_CHOICES = [
        ('boys', 'Boys Wear'),
        ('girls', 'Girls Wear'),
        ('mens', 'Mens Wear'),
    ('womens', 'Womens Wear'),
        
    ]
    SIZE_CHOICES = [
        ('S', 'Small'),
        ('M', 'Medium'),
        ('L', 'Large'),
        ('XL', 'Extra Large')
    ]
    
    
    name = models.CharField(max_length=100)
    description = models.TextField()
    price = models.FloatField()
    image = models.ImageField(upload_to='products/')
    category = models.CharField(
        max_length=10,
        choices=CATEGORY_CHOICES,
        default='boys' )
    sizes = models.JSONField(default=list)


class Review(models.Model):
    product = models.ForeignKey(Product, related_name="reviews", on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.IntegerField(default=1)
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
