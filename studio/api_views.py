import json
from django.http import JsonResponse
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods


def item_detail(request, item_id: int):
    """GET /items/<item_id>/ — вернуть item_id."""
    return JsonResponse({
        "app_name": settings.APP_NAME,
        "item_id": item_id,
        "message": f"Item {item_id} retrieved",
    })


def users_list(request):
    """GET /users/?name=&age= — вернуть опциональные параметры."""
    name = request.GET.get("name")          # str | None
    age_raw = request.GET.get("age")        # str | None
    age = int(age_raw) if age_raw else None

    return JsonResponse({
        "app_name": settings.APP_NAME,
        "name": name,
        "age": age,
        "message": "Users retrieved",
    })


def status(request):
    """GET /status/ — проверка живости."""
    return JsonResponse({
        "status": "ok",
        "app_name": settings.APP_NAME,
    })


@csrf_exempt
@require_http_methods(["POST"])
def create_item(request):
    """POST /items/ — принять JSON и вернуть его обратно."""
    try:
        data = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    return JsonResponse({
        "app_name": settings.APP_NAME,
        "created": True,
        "item": data,
    }, status=201)