import os
from celery import Celery
from dotenv import load_dotenv

load_dotenv()

redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")

if redis_url.startswith("rediss://") and "ssl_cert_reqs" not in redis_url:
    separator = "&" if "?" in redis_url else "?"
    redis_url += f"{separator}ssl_cert_reqs=CERT_NONE"
celery_app = Celery(
    "worker",
    broker=redis_url,
    backend=redis_url
)

celery_app.conf.task_routes = {
    "app.worker.tasks.*": {"queue": "sih_tasks"}
}

celery_app.autodiscover_tasks(["app.worker.tasks"])
