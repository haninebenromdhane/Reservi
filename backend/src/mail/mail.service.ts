import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export interface SendMailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/*
 * Service d'envoi d'e-mails (SMTP via nodemailer).
 *
 * Configuration via variables d'environnement :
 *   SMTP_HOST, SMTP_PORT, SMTP_SECURE ("true"/"false"), SMTP_USER,
 *   SMTP_PASS, MAIL_FROM (adresse d'expédition affichée).
 *
 * Si SMTP_HOST n'est pas configuré (ex: environnement de
 * développement local sans serveur mail), le service n'échoue pas :
 * il journalise l'e-mail dans la console à la place, pour ne jamais
 * bloquer un flux applicatif (inscription, mot de passe...) faute de
 * configuration SMTP.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;
  private readonly from: string;

  constructor() {
    this.from = process.env.MAIL_FROM ?? 'Reservi <no-reply@reservi.local>';

    if (process.env.SMTP_HOST) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: process.env.SMTP_USER
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            }
          : undefined,
      });
    } else {
      this.logger.warn(
        "SMTP_HOST non défini : les e-mails seront journalisés dans la console au lieu d'être envoyés (configurez SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS/MAIL_FROM dans .env pour un envoi réel).",
      );
    }
  }

  async send({ to, subject, html, text }: SendMailInput): Promise<void> {
    if (!this.transporter) {
      this.logger.log(
        `[Email simulé — SMTP non configuré] À: ${to} | Sujet: ${subject}\n${text ?? html}`,
      );
      return;
    }

    try {
      await this.transporter.sendMail({
        from: this.from,
        to,
        subject,
        html,
        text: text ?? html.replace(/<[^>]+>/g, ' '),
      });
    } catch (error) {
      // L'échec d'envoi d'e-mail ne doit jamais faire planter l'action
      // métier qui l'a déclenché (inscription, changement de mot de
      // passe déjà validé côté serveur, etc.).
      this.logger.error(
        `Échec de l'envoi de l'e-mail à ${to} : ${(error as Error).message}`,
      );
    }
  }

  async sendPasswordChangeVerification(
    to: string,
    firstName: string,
    confirmUrl: string,
  ) {
    await this.send({
      to,
      subject: 'Confirmez votre changement de mot de passe — Reservi',
      html: `
        <p>Bonjour ${firstName},</p>
        <p>Vous avez demandé à changer le mot de passe de votre compte Reservi.</p>
        <p>Pour confirmer ce changement, cliquez sur le lien ci-dessous (valable 30 minutes) :</p>
        <p><a href="${confirmUrl}">${confirmUrl}</a></p>
        <p>Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet e-mail : votre mot de passe actuel restera inchangé.</p>
      `,
    });
  }

  async sendPasswordResetLink(to: string, resetUrl: string) {
    await this.send({
      to,
      subject: 'Réinitialisation de votre mot de passe — Reservi',
      html: `
        <p>Vous avez demandé la réinitialisation de votre mot de passe Reservi.</p>
        <p>Cliquez sur le lien ci-dessous pour choisir un nouveau mot de passe (valable 1 heure) :</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.</p>
      `,
    });
  }
}
