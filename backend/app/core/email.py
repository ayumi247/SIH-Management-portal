import os
import httpx

def send_email_notification(to_email: str, subject: str, text: str):
    SENDPULSE_API_KEY = os.getenv("SENDPULSE_API_KEY")
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
    
    try:
        response = httpx.post(url, headers=headers, json=payload, timeout=10.0)
        if response.status_code == 200:
            print(f"Email successfully sent to {to_email}")
            return True
        else:
            print(f"Failed to send email: {response.text}")
            return False
    except Exception as e:
        print(f"Exception while sending email: {e}")
        return False
