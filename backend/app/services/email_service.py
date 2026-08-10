import smtplib
from email.message import EmailMessage

from app.core.config import settings


class EmailService:

    def __init__(self):
        self.host = settings.mail_host
        self.port = settings.mail_port
        self.username = settings.mail_username
        self.password = settings.mail_password
        self.from_email = settings.mail_from
        self.from_name = settings.mail_from_name

    def send_email(
        self,
        to_email: str,
        subject: str,
        body: str,
    ) -> None:

        message = EmailMessage()

        message["From"] = (
            f"{self.from_name} <{self.from_email}>"
        )

        message["To"] = to_email
        message["Subject"] = subject

        message.set_content(body)

        with smtplib.SMTP(
            self.host,
            self.port,
        ) as server:

            server.starttls()

            server.login(
                self.username,
                self.password,
            )

            server.send_message(
                message,
            )

    def send_password_reset_email(
        self,
        to_email: str,
        reset_url: str,
    ) -> None:

        subject = (
            "Reset Your Password - "
            "Smart Meeting Room"
        )

        body = (
            "Hello,\n\n"
            "We received a request to reset "
            "your password.\n\n"
            "Click the link below to reset "
            "your password:\n\n"
            f"{reset_url}\n\n"
            "This link will expire in 30 minutes.\n\n"
            "If you did not request a password reset, "
            "you can safely ignore this email.\n\n"
            "Regards,\n"
            "Smart Meeting Room Team"
        )

        self.send_email(
            to_email=to_email,
            subject=subject,
            body=body,
        )