import uuid
import logging
from threading import local

_thread_locals = local()

def get_correlation_id():
    return getattr(_thread_locals, 'correlation_id', None)

class CorrelationIdMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        correlation_id = request.headers.get('X-Correlation-ID')
        if not correlation_id:
            correlation_id = str(uuid.uuid4())
        
        _thread_locals.correlation_id = correlation_id
        request.correlation_id = correlation_id
        
        response = self.get_response(request)
        
        response['X-Correlation-ID'] = correlation_id
        return response

class ContextFilter(logging.Filter):
    def filter(self, record):
        record.correlation_id = get_correlation_id()
        return True
