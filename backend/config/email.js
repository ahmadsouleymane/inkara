import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

export const emailConfig = {
  from: process.env.EMAIL_FROM || 'SmartLib <noreply@smartlib.app>',
  enabled: !!(process.env.SMTP_USER && process.env.SMTP_PASS),
};

export default transporter;
