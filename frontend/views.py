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
            return HttpResponse(
                """
                This URL is also handled by the React app and does not correspond to a Django view.
                If you're seeing this message, it means you've not built your React app properly
                or you've not configured your URLs or your 'index.html' file is not in the right directory.
                """,
                status=501,
            )
