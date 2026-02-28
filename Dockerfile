FROM python:3.11-slim

WORKDIR /app

# install system deps
RUN apt-get update && apt-get install -y build-essential libpq-dev && rm -rf /var/lib/apt/lists/*

# copy dependency files
COPY backend/requirements.txt /app/backend/requirements.txt

# install python deps
RUN pip install --upgrade pip
RUN pip install -r /app/backend/requirements.txt

# copy app
COPY . /app

ENV PYTHONUNBUFFERED=1
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
