from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Product, Review
from .serializers import ProductSerializer, ReviewSerializer

import pandas as pd
from django.http import HttpResponse
import io

# For PDF
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas


from rest_framework.permissions import IsAuthenticated


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def get_permissions(self):
        # Allow anyone to list/retrieve, but require auth for create/update/delete
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated()]
        return super().get_permissions()

    #Generate bill (JSON API)
    @action(detail=False, methods=['post'])
    def generate_bill(self, request):
        try:
            cart = request.data.get("cart", [])
            user = request.data.get("user", {})

            if not cart:
                return Response({"error": "Cart is empty"}, status=400)

            df = pd.DataFrame(cart)
            df["name"] = df.get("name", "Unknown Product")
            df["price"] = df.get("price", 0)
            df["quantity"] = df.get("quantity", 1)

            df["total"] = df["price"].astype(float) * df["quantity"].astype(int)

            total_items = int(df["quantity"].sum())
            total_price = float(df["total"].sum())

            # prefer authenticated user info for buyer
            buyer_name = request.user.username if request.user.is_authenticated else user.get("name", "Guest")
            buyer_phone = user.get("phone", "N/A")

            bill = {
                "buyer": buyer_name,
                "phone": buyer_phone,
                "items": df.to_dict(orient="records"),
                "total_items": total_items,
                "total_price": total_price,
            }

            return Response(bill, status=200)

        except Exception as e:
            return Response({"error": f"Failed to generate bill: {str(e)}"}, status=500)

    #Download bill as CSV
    @action(detail=False, methods=['post'])
    def download_bill_csv(self, request):
        try:
            cart = request.data.get("cart", [])
            user = request.data.get("user", {})

            if not isinstance(cart, list) or not cart:
                return Response({"error": "Cart must be a list of items"}, status=400)

            df = pd.DataFrame(cart)
            df["total"] = df["price"].astype(float) * df["quantity"].astype(int)

            summary_row = pd.DataFrame([{
                "name": f"Total Items: {df['quantity'].sum()}",
                "price": "",
                "quantity": "",
                "total": df["total"].sum()
            }])
            df = pd.concat([df, summary_row], ignore_index=True)

            # Convert to CSV
            csv_buffer = io.StringIO()
            df.to_csv(csv_buffer, index=False)
            csv_data = csv_buffer.getvalue()

            response = HttpResponse(csv_data, content_type="text/csv")
            filename = f'bill_{user.get("name", "guest")}.csv'
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response

        except Exception as e:
            return Response({"error": f"Failed to generate CSV: {str(e)}"}, status=500)

    #Download bill as PDF
    @action(detail=False, methods=['post'])
    def download_bill_pdf(self, request):
        try:
            cart = request.data.get("cart", [])
            user = request.data.get("user", {})

            if not isinstance(cart, list) or not cart:
                return Response({"error": "Cart must be a list of items"}, status=400)

            buyer_name = request.user.username if request.user.is_authenticated else user.get("name", "Guest")
            buyer_phone = user.get("phone", "N/A")

            buffer = io.BytesIO()
            p = canvas.Canvas(buffer, pagesize=A4)
            width, height = A4

            p.setFont("Helvetica-Bold", 16)
            p.drawString(200, height - 50, "🛒 DressDesk Bill")

            p.setFont("Helvetica", 12)
            p.drawString(50, height - 80, f"Buyer: {buyer_name}")
            p.drawString(50, height - 100, f"Phone: {buyer_phone}")

            y = height - 140
            p.setFont("Helvetica-Bold", 11)
            p.drawString(50, y, "Product")
            p.drawString(250, y, "Price")
            p.drawString(350, y, "Quantity")
            p.drawString(450, y, "Total")

            total_price = 0
            total_items = 0
            p.setFont("Helvetica", 11)
            for item in cart:
                y -= 20
                if y < 100:
                    p.showPage()
                    y = height - 50

                name = item.get("name", "Unknown")
                price = float(item.get("price", 0))
                qty = int(item.get("quantity", 1))
                line_total = price * qty

                p.drawString(50, y, str(name))
                p.drawString(250, y, f"{price:.2f}")
                p.drawString(350, y, str(qty))
                p.drawString(450, y, f"{line_total:.2f}")

                total_items += qty
                total_price += line_total

            y -= 30
            p.setFont("Helvetica-Bold", 12)
            p.drawString(50, y, f"Total Items: {total_items}")
            p.drawString(250, y, f"Grand Total: ₹{total_price:.2f}")

            p.showPage()
            p.save()
            pdf = buffer.getvalue()
            buffer.close()

            response = HttpResponse(pdf, content_type='application/pdf')
            filename = f'bill_{buyer_name}.pdf'
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response

        except Exception as e:
            return Response({"error": f"Failed to generate PDF: {str(e)}"}, status=500)

    # Override create to ensure only authenticated users can add products
    def create(self, request, *args, **kwargs):
        if not request.user or not request.user.is_authenticated:
            return Response({'error': 'Authentication required to add products.'}, status=401)
        return super().create(request, *args, **kwargs)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def buy(self, request, pk=None):
        # Simple buy endpoint - ensure the user is authenticated
        product = self.get_object()
        quantity = int(request.data.get('quantity', 1))
        # In a real app we'd create an Order object, reduce stock, process payment, etc.
        return Response({'message': f'{request.user.username} bought {quantity} x {product.name}.'}, status=200)

