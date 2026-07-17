# AWS Deploy & Cloud Services Setup Guide

This guide details the configurations required to deploy your Progressive Web App (PWA) backend to **AWS Elastic Beanstalk**, host media file uploads on **AWS S3**, and send notifications using **Firebase Cloud Messaging** and **Twilio SMS**.

---

## 1. ☁️ AWS Elastic Beanstalk (Backend Deploy)

AWS Elastic Beanstalk automatically runs your Django Python application. Follow these configuration guidelines:

### Create Beanstalk Configuration files
At the root of your `backend/` directory, verify or create:

- **`Procfile`**:
  ```text
  web: gunicorn config.wsgi:application
  ```
- **`.ebextensions/django.config`**:
  ```yaml
  option_settings:
    aws:elasticbeanstalk:container:python:
      WSGIPath: config.wsgi:application
    aws:elasticbeanstalk:application:environment:
      DJANGO_SETTINGS_MODULE: config.settings
  ```

---

## 2. 🗄️ AWS S3 Bucket Setup (Media Storage)

Django is configured to automatically switch media uploads (such as food scan photos) to S3 when the keys are detected.

### Setup Instructions
1. Open the **AWS Console** and navigate to **S3**.
2. Create a new S3 Bucket (e.g., `ai-tracker-media-bucket`).
3. Under **Permissions**, disable "Block all public access" to allow user avatars and food log photos to display publicly.
4. Set the **CORS Configuration** to:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": []
     }
   ]
   ```
5. In **IAM Console**, create a user with programmatic access and attach the `AmazonS3FullAccess` policy. Copy the Access Keys.
6. Configure the Beanstalk environment variables:
   - `AWS_ACCESS_KEY_ID`: Your IAM user access key.
   - `AWS_SECRET_ACCESS_KEY`: Your IAM user secret key.
   - `AWS_STORAGE_BUCKET_NAME`: The exact bucket name created.
   - `AWS_S3_REGION_NAME`: e.g. `us-east-1`.

---

## 3. 💬 Twilio SMS Setup

We have integrated Twilio SMS into the `/api/send-reminder/` endpoint for medication, water, meal, and exercise alerts.

### Configuration
Set the following environment variables in your hosting dashboard:
- `TWILIO_ACCOUNT_SID`: Found on your Twilio Console home page.
- `TWILIO_AUTH_TOKEN`: Found on your Twilio Console home page.
- `TWILIO_PHONE_NUMBER`: The active virtual Twilio number assigned to your account.

---

## 4. 🔥 Firebase Cloud Messaging (FCM) Push Notifications

For mobile PWA push notifications:
- Client registration tokens are posted to `/api/send-reminder/` as a fallback.
- FCM handles mobile push delivery when service workers match device endpoints.
