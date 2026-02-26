
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserSerializer, LoginSerializer
from .models import User
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from rest_framework.permissions import AllowAny


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
	serializer = UserSerializer(data=request.data)
	if serializer.is_valid():
		user = serializer.save()
		token, _ = Token.objects.get_or_create(user=user)
		return Response({'token': token.key, 'user': UserSerializer(user).data}, status=status.HTTP_201_CREATED)
	return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
	serializer = LoginSerializer(data=request.data)
	if not serializer.is_valid():
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
	email = serializer.validated_data['email']
	password = serializer.validated_data['password']

	try:
		user = User.objects.get(email=email)
	except User.DoesNotExist:
		return Response({'error': 'Email not registered. Please register first.'}, status=status.HTTP_400_BAD_REQUEST)

	user = authenticate(request, username=user.username, password=password)
	if user is None:
		return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)

	token, _ = Token.objects.get_or_create(user=user)
	return Response({'token': token.key, 'user': UserSerializer(user).data}, status=status.HTTP_200_OK)
