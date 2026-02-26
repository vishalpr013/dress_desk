from django.contrib import admin
from .models import Product

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'category')  # show these columns in list
    list_filter = ('category',)  # filter sidebar by category
    search_fields = ('name', 'description')  # optional search bar
