FROM python:3.12-slim
WORKDIR /app
COPY . /app
RUN pip install --no-cache-dir qrcode==8.2
EXPOSE 8000
CMD ["sh", "-c", "python3 servidor.py --host 0.0.0.0 --puerto ${PORT:-8000}"]
