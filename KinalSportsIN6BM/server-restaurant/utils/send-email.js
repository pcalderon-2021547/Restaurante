import nodemailer from 'nodemailer';
import { renderEmailTemplate } from '../src/utils/reactEmailTemplate.js';

const isFullHtml = (value) => {
  if (!value) return false;
  return /^\s*(<!doctype html>|<html\b)/i.test(value);
};

export const sendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: false },
  });

  const emailHtml = isFullHtml(html)
    ? html
    : renderEmailTemplate({
        title: subject,
        preheader: subject,
        heading: subject,
        intro: '',
        bodyHtml: html,
        buttonText: null,
        buttonUrl: null,
        fallbackText: null,
        fallbackUrl: null,
        notice: null,
      });

  await transporter.sendMail({
    from: `"Sistema Restaurante" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: emailHtml,
  });
};