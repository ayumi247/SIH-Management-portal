import os
import httpx
from app.worker.celery_app import celery_app

SENDPULSE_API_KEY = os.getenv("SENDPULSE_API_KEY")

@celery_app.task(name="send_email_notification")
def send_email_notification(to_email: str, subject: str, text: str):
    if not SENDPULSE_API_KEY:
        print("Failed to get SendPulse API Key. Check credentials.")
        return False
        
    url = "https://api.sendpulse.com/smtp/emails"
    headers = {
        "Authorization": f"Bearer {SENDPULSE_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "email": {
            "html": text,
            "text": text,
            "subject": subject,
            "from": {
                "name": "Hackathon Matchmaker",
                "email": "noreply@sih-matchmaker.com" # Replace with verified sender
            },
            "to": [
                {
                    "name": to_email,
                    "email": to_email
                }
            ]
        }
    }
    
    response = httpx.post(url, headers=headers, json=payload)
    if response.status_code == 200:
        print(f"Email successfully sent to {to_email}")
        return True
    else:
        print(f"Failed to send email: {response.text}")
        return False
