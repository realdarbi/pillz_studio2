#!/bin/bash
echo "Устанавливаем зависимости..."
pip install --upgrade pip
pip install -r requirements.txt

echo "Собираем статику..."
python manage.py collectstatic --noinput

# Миграции не запускаем — они накатятся при старте приложения