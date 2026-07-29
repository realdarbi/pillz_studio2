#!/bin/bash
echo "Installing dependencies..."

# Создаём виртуальное окружение
python3 -m venv venv

# Активируем его
source venv/bin/activate

# Устанавливаем зависимости
pip install --upgrade pip
pip install -r requirements.txt

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Running migrations..."
python manage.py migrate --noinput