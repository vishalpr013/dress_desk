import csv
import io

from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

from products.models import Product
from .models import Cart, CartItem, Order, OrderItem


def _get_cart(user) -> Cart:
    cart, _ = Cart.objects.get_or_create(user=user)
    return cart


def _serialize_cart(cart: Cart):
    items = []
    total_items = 0
    total_price = 0.0

    for ci in cart.items.select_related("product").all():
        p = ci.product
        qty = int(ci.quantity or 1)
        price = float(p.price or 0)
        line_total = qty * price

        image = ""
        try:
            image = p.image.url if p.image else ""
        except Exception:
            image = str(p.image) if p.image else ""

        items.append(
            {
                "id": p.id,
                "name": p.name,
                "description": p.description,
                "price": price,
                "image": image,
                "category": p.category,
                "sizes": p.sizes,
                "selectedSize": ci.selected_size,
                "quantity": qty,
                "lineTotal": line_total,
            }
        )
        total_items += qty
        total_price += line_total

    return {"items": items, "totalItems": total_items, "totalPrice": total_price}


def _parse_product_and_size(request):
    product_id = request.data.get("product_id") or request.data.get("productId") or request.data.get("id")
    selected_size = request.data.get("selected_size") or request.data.get("selectedSize") or ""

    if not product_id:
        return None, None, Response({"error": "product_id is required"}, status=status.HTTP_400_BAD_REQUEST)
    if not selected_size:
        return None, None, Response({"error": "selected_size is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        product = Product.objects.get(pk=product_id)
    except Product.DoesNotExist:
        return None, None, Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

    # optional validation against product.sizes list
    if isinstance(product.sizes, list) and product.sizes and selected_size not in product.sizes:
        return None, None, Response({"error": "Invalid size for this product"}, status=status.HTTP_400_BAD_REQUEST)

    return product, selected_size, None


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def cart_detail(request):
    cart = _get_cart(request.user)
    return Response(_serialize_cart(cart), status=200)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def cart_add(request):
    product, selected_size, err_resp = _parse_product_and_size(request)
    if err_resp:
        return err_resp

    cart = _get_cart(request.user)
    item, created = CartItem.objects.get_or_create(
        cart=cart, product=product, selected_size=selected_size, defaults={"quantity": 1}
    )
    if not created:
        item.quantity = int(item.quantity or 1) + 1
        item.save(update_fields=["quantity", "updated_at"])

    return Response(_serialize_cart(cart), status=200)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def cart_decrement(request):
    product, selected_size, err_resp = _parse_product_and_size(request)
    if err_resp:
        return err_resp

    cart = _get_cart(request.user)
    try:
        item = CartItem.objects.get(cart=cart, product=product, selected_size=selected_size)
    except CartItem.DoesNotExist:
        return Response(_serialize_cart(cart), status=200)

    item.quantity = int(item.quantity or 1) - 1
    if item.quantity <= 0:
        item.delete()
    else:
        item.save(update_fields=["quantity", "updated_at"])

    return Response(_serialize_cart(cart), status=200)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def cart_remove(request):
    product, selected_size, err_resp = _parse_product_and_size(request)
    if err_resp:
        return err_resp

    cart = _get_cart(request.user)
    CartItem.objects.filter(cart=cart, product=product, selected_size=selected_size).delete()
    return Response(_serialize_cart(cart), status=200)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def cart_clear(request):
    cart = _get_cart(request.user)
    cart.items.all().delete()
    return Response(_serialize_cart(cart), status=200)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def cart_download_csv(request):
    cart = _get_cart(request.user)
    data = _serialize_cart(cart)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Item", "Size", "Quantity", "Price", "Line Total"])
    for it in data["items"]:
        writer.writerow(
            [
                it.get("name", ""),
                it.get("selectedSize", ""),
                it.get("quantity", 1),
                f'{float(it.get("price", 0)):.2f}',
                f'{float(it.get("lineTotal", 0)):.2f}',
            ]
        )
    writer.writerow(["TOTAL", "", data["totalItems"], "", f'{float(data["totalPrice"]):.2f}'])

    resp = HttpResponse(output.getvalue(), content_type="text/csv")
    resp["Content-Disposition"] = f'attachment; filename="order_{request.user.username}.csv"'
    return resp


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def cart_download_pdf(request):
    cart = _get_cart(request.user)
    data = _serialize_cart(cart)

    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    p.setFont("Helvetica-Bold", 16)
    p.drawString(190, height - 50, "DressDesk Order Summary")

    p.setFont("Helvetica", 12)
    p.drawString(50, height - 80, f"Buyer: {request.user.username}")

    y = height - 120
    p.setFont("Helvetica-Bold", 11)
    p.drawString(50, y, "Product")
    p.drawString(260, y, "Size")
    p.drawString(320, y, "Qty")
    p.drawString(380, y, "Price")
    p.drawString(460, y, "Total")

    p.setFont("Helvetica", 11)
    for it in data["items"]:
        y -= 20
        if y < 100:
            p.showPage()
            y = height - 60
            p.setFont("Helvetica-Bold", 11)
            p.drawString(50, y, "Product")
            p.drawString(260, y, "Size")
            p.drawString(320, y, "Qty")
            p.drawString(380, y, "Price")
            p.drawString(460, y, "Total")
            p.setFont("Helvetica", 11)
            y -= 20

        name = str(it.get("name", ""))[:32]
        size = str(it.get("selectedSize", ""))
        qty = int(it.get("quantity", 1))
        price = float(it.get("price", 0))
        line_total = float(it.get("lineTotal", 0))

        p.drawString(50, y, name)
        p.drawString(260, y, size)
        p.drawString(320, y, str(qty))
        p.drawString(380, y, f"{price:.2f}")
        p.drawString(460, y, f"{line_total:.2f}")

    y -= 30
    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, y, f"Total Items: {data['totalItems']}")
    p.drawString(260, y, f"Grand Total: ₹{float(data['totalPrice']):.2f}")

    p.showPage()
    p.save()

    pdf = buffer.getvalue()
    buffer.close()

    resp = HttpResponse(pdf, content_type="application/pdf")
    resp["Content-Disposition"] = f'attachment; filename="order_{request.user.username}.pdf"'
    return resp


# ── Order / Checkout ─────────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def checkout(request):
    """Convert the current cart into a persisted Order, clear the cart, return order data."""
    cart = _get_cart(request.user)
    cart_data = _serialize_cart(cart)

    if not cart_data["items"]:
        return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

    order = Order.objects.create(
        user=request.user,
        total_items=cart_data["totalItems"],
        total_price=cart_data["totalPrice"],
    )

    order_items = []
    for it in cart_data["items"]:
        order_items.append(
            OrderItem(
                order=order,
                product_id=it["id"],
                product_name=it["name"],
                product_price=it["price"],
                selected_size=it.get("selectedSize", ""),
                quantity=it["quantity"],
                line_total=it["lineTotal"],
            )
        )
    OrderItem.objects.bulk_create(order_items)

    # clear the cart
    cart.items.all().delete()

    return Response(
        {
            "message": "Order placed successfully!",
            "order": _serialize_order(order),
        },
        status=201,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def order_history(request):
    """Return all orders for the authenticated user, newest first."""
    orders = Order.objects.filter(user=request.user).prefetch_related("items")
    data = [_serialize_order(o) for o in orders]
    return Response(data, status=200)


def _serialize_order(order: Order):
    items = []
    for oi in order.items.all():
        items.append(
            {
                "productName": oi.product_name,
                "productPrice": oi.product_price,
                "selectedSize": oi.selected_size,
                "quantity": oi.quantity,
                "lineTotal": oi.line_total,
            }
        )
    return {
        "id": order.id,
        "totalItems": order.total_items,
        "totalPrice": order.total_price,
        "createdAt": order.created_at.isoformat(),
        "items": items,
    }


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def download_orders_pdf(request):
    """Generate a single PDF report of all past orders for the authenticated user."""
    orders = Order.objects.filter(user=request.user).prefetch_related("items")

    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    # ── Title page header ────────────────────────────────────────────
    p.setFont("Helvetica-Bold", 18)
    p.drawString(150, height - 50, "DressDesk — Order History")

    p.setFont("Helvetica", 11)
    p.drawString(50, height - 80, f"Buyer: {request.user.username}")
    p.drawString(50, height - 100, f"Total Orders: {orders.count()}")

    y = height - 140

    if not orders.exists():
        p.setFont("Helvetica", 12)
        p.drawString(50, y, "No orders found.")
        p.showPage()
        p.save()
        pdf = buffer.getvalue()
        buffer.close()
        resp = HttpResponse(pdf, content_type="application/pdf")
        resp["Content-Disposition"] = f'attachment; filename="order_history_{request.user.username}.pdf"'
        return resp

    for order in orders:
        # ── Order header ─────────────────────────────────────────────
        if y < 160:
            p.showPage()
            y = height - 50

        p.setStrokeColorRGB(0.9, 0.3, 0.25)
        p.setFillColorRGB(0.9, 0.3, 0.25)
        p.rect(45, y - 5, width - 90, 22, fill=True, stroke=False)
        p.setFillColorRGB(1, 1, 1)
        p.setFont("Helvetica-Bold", 11)
        order_date = order.created_at.strftime("%d %b %Y, %I:%M %p")
        p.drawString(55, y, f"Order #{order.id}  —  {order_date}")
        p.drawRightString(width - 55, y, f"Total: ₹{order.total_price:.2f}")

        y -= 30
        p.setFillColorRGB(0, 0, 0)

        # table header
        p.setFont("Helvetica-Bold", 10)
        p.drawString(55, y, "Product")
        p.drawString(280, y, "Size")
        p.drawString(340, y, "Qty")
        p.drawString(400, y, "Price")
        p.drawString(480, y, "Total")
        y -= 15
        p.setStrokeColorRGB(0.8, 0.8, 0.8)
        p.line(55, y + 4, width - 55, y + 4)

        # items
        p.setFont("Helvetica", 10)
        for oi in order.items.all():
            y -= 16
            if y < 60:
                p.showPage()
                y = height - 50
                p.setFont("Helvetica", 10)

            name = str(oi.product_name)[:35]
            p.drawString(55, y, name)
            p.drawString(280, y, oi.selected_size or "—")
            p.drawString(340, y, str(oi.quantity))
            p.drawString(400, y, f"{oi.product_price:.2f}")
            p.drawString(480, y, f"{oi.line_total:.2f}")

        # order footer line
        y -= 10
        p.setStrokeColorRGB(0.8, 0.8, 0.8)
        p.line(55, y + 4, width - 55, y + 4)
        y -= 14
        p.setFont("Helvetica-Bold", 10)
        p.drawString(55, y, f"Items: {order.total_items}")
        p.drawRightString(width - 55, y, f"Grand Total: ₹{order.total_price:.2f}")
        y -= 30  # gap before next order

    p.showPage()
    p.save()

    pdf = buffer.getvalue()
    buffer.close()

    resp = HttpResponse(pdf, content_type="application/pdf")
    resp["Content-Disposition"] = f'attachment; filename="order_history_{request.user.username}.pdf"'
    return resp
