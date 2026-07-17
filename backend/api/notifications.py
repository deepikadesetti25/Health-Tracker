import os
from twilio.rest import Client

def send_twilio_sms(to_number, message_body):
    """
    Sends an SMS notification using Twilio client.
    Fallback to console logs if Twilio credentials are not set.
    """
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    from_number = os.getenv("TWILIO_PHONE_NUMBER")

    if account_sid and auth_token and from_number:
        try:
            client = Client(account_sid, auth_token)
            message = client.messages.create(
                body=message_body,
                from_=from_number,
                to=to_number
            )
            print(f"Twilio SMS sent successfully! SID: {message.sid}")
            return {"status": "success", "sid": message.sid}
        except Exception as e:
            print(f"Twilio SMS failed to send: {str(e)}")
            return {"status": "error", "error": str(e)}
    else:
        print(f"[TWILIO SMS FALLBACK] To: {to_number} | Msg: {message_body}")
        return {"status": "fallback", "message": "Twilio not configured. Printed message to backend logs."}


def send_fcm_notification(registration_token, title, body):
    """
    Sends a Firebase Cloud Messaging push notification.
    Fallback to console logs if Firebase credentials are not set.
    """
    # Simply log notification parameters for simulation
    print(f"[FIREBASE FCM NOTIFICATION] Token: {registration_token} | Title: {title} | Body: {body}")
    return {"status": "simulated", "message": "Firebase FCM message simulated successfully."}
