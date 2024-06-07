from rapidfuzz import process
from django.db.models import Model

def find_best_match(name, choices, threshold=90):
    result = process.extractOne(name, choices)
    if result:
        match, score, *_ = result  # Unpack only the first two values
        return match if score >= threshold else None
    return None

def get_best_match_or_create(model: Model, name: str, threshold=90, defaults=None):
    existing_names = list(model.objects.values_list('name', flat=True))
    best_match = find_best_match(name, existing_names, threshold)
    
    if best_match:
        return model.objects.get(name=best_match), False
    else:
        return model.objects.get_or_create(name=name, defaults=defaults)



