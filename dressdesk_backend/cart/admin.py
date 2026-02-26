from django.contrib import admin

from .models import Cart, CartItem


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    autocomplete_fields = ["product"]


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "updated_at")
    search_fields = ("user__username", "user__email")
    inlines = [CartItemInline]


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ("id", "cart", "product", "selected_size", "quantity", "updated_at")
    list_filter = ("selected_size",)
    search_fields = ("cart__user__username", "cart__user__email", "product__name")

