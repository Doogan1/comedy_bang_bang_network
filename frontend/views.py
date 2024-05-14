from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import render
from django.http import HttpResponse
from django.views.generic import View
from django.conf import settings
import os

class FrontendAppView(View):
    def get(self, request):
        try:
            with open(os.path.join(settings.BASE_DIR, 'frontend', 'dist', 'index.html')) as f:
                return HttpResponse(f.read())
        except FileNotFoundError:
            return HttpResponse("Index.html not found", status=404)


    
def index(request):
    return render(request, 'index.html')
