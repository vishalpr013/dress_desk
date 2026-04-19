from django.urls import path

from . import views


urlpatterns = [
    path("cart/", views.cart_detail, name="cart-detail"),
    path("cart/add/", views.cart_add, name="cart-add"),
    path("cart/decrement/", views.cart_decrement, name="cart-decrement"),
    path("cart/remove/", views.cart_remove, name="cart-remove"),
    path("cart/clear/", views.cart_clear, name="cart-clear"),
    path("cart/download/csv/", views.cart_download_csv, name="cart-download-csv"),
    path("cart/download/pdf/", views.cart_download_pdf, name="cart-download-pdf"),
    path("cart/checkout/", views.checkout, name="cart-checkout"),
    path("cart/orders/", views.order_history, name="order-history"),
    path("cart/orders/download/pdf/", views.download_orders_pdf, name="orders-download-pdf"),
]
