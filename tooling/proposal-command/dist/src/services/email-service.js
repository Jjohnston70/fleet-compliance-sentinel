/**
 * Email Service - Stub for email delivery using Resend API pattern
 * Implements sending proposal emails to clients
 */
import { CONFIG } from '../config';
export class EmailService {
    /**
     * Send proposal email
     * Currently a stub - integrate with Resend API or your email provider
     */
    async sendProposalEmail(payload) {
        // Validate email configuration
        if (!CONFIG.EMAIL.API_KEY) {
            console.warn('Email API key not configured. Email not sent.');
            return { success: false };
        }
        try {
            // Stub implementation - replace with actual Resend API call
            const result = await this.sendViaResend(payload);
            return result;
        }
        catch (error) {
            console.error('Failed to send email:', error);
            return { success: false };
        }
    }
    /**
     * Send via Resend API (stub)
     * TODO: Implement actual Resend API integration
     */
    async sendViaResend(payload) {
        // Example Resend API call structure:
        // const response = await fetch('https://api.resend.com/emails', {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //     'Authorization': `Bearer ${CONFIG.EMAIL.API_KEY}`,
        //   },
        //   body: JSON.stringify({
        //     from: `${CONFIG.EMAIL.FROM_NAME} <${CONFIG.EMAIL.FROM_EMAIL}>`,
        //     to: payload.to,
        //     cc: payload.cc,
        //     replyTo: payload.replyTo || CONFIG.EMAIL.REPLY_TO,
        //     subject: payload.subject,
        //     html: payload.htmlBody,
        //     text: payload.plainText,
        //     // For attachments, Resend uses base64 encoding
        //   }),
        // });
        //
        // if (!response.ok) {
        //   throw new Error(`Resend API error: ${response.statusText}`);
        // }
        //
        // const data = await response.json();
        // return { success: true, messageId: data.id };
        // Stub: Log and return success
        console.log('Email would be sent:', {
            to: payload.to,
            subject: payload.subject,
            from: `${CONFIG.EMAIL.FROM_NAME} <${CONFIG.EMAIL.FROM_EMAIL}>`,
        });
        return {
            success: true,
            messageId: `stub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };
    }
    /**
     * Create proposal email payload from proposal data
     */
    static createProposalEmailPayload(clientEmail, clientName, projectTitle, clientCompany, proposalPdfBuffer, proposalNumber) {
        const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background-color: ${CONFIG.BRANDING.PRIMARY_COLOR}; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .footer { background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666; }
    .button { display: inline-block; background-color: ${CONFIG.BRANDING.PRIMARY_COLOR}; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${CONFIG.BRANDING.NAME}</h1>
    </div>

    <div class="content">
      <p>Dear ${clientName},</p>

      <p>Thank you for your interest in our services. We're excited to present our proposal for <strong>${projectTitle}</strong> at <strong>${clientCompany}</strong>.</p>

      <p>Please find the attached PDF with our comprehensive proposal that outlines:</p>
      <ul>
        <li>Detailed project scope and deliverables</li>
        <li>Timeline and milestones</li>
        <li>Pricing and payment terms</li>
        <li>Our approach and methodology</li>
        <li>Team qualifications and experience</li>
      </ul>

      <p>We believe this proposal demonstrates our commitment to delivering exceptional results for your organization.</p>

      <p style="margin-top: 30px;"><strong>Next Steps:</strong></p>
      <p>Please review the attached proposal at your convenience. We're happy to schedule a call to discuss any questions you may have or to clarify any details.</p>

      <p>Feel free to reach out to me directly at ${CONFIG.EMAIL.REPLY_TO} or ${CONFIG.BRANDING.PHONE}.</p>

      <p>We look forward to the opportunity to work with you!</p>

      <p>Best regards,<br>
      <strong>${CONFIG.BRANDING.NAME}</strong></p>
    </div>

    <div class="footer">
      <p><strong>${CONFIG.BRANDING.NAME}</strong><br>
      ${CONFIG.BRANDING.ADDRESS ? CONFIG.BRANDING.ADDRESS + '<br>' : ''}
      <a href="${CONFIG.BRANDING.WEBSITE}">${CONFIG.BRANDING.WEBSITE}</a></p>
      <p style="margin-top: 15px; font-size: 11px;">
        Proposal ID: ${proposalNumber}<br>
        This proposal is confidential and intended solely for the addressee.
      </p>
    </div>
  </div>
</body>
</html>
    `;
        const plainText = `
Dear ${clientName},

Thank you for your interest in our services. We're excited to present our proposal for "${projectTitle}" at ${clientCompany}.

Please find attached our comprehensive proposal that outlines:
- Detailed project scope and deliverables
- Timeline and milestones
- Pricing and payment terms
- Our approach and methodology
- Team qualifications and experience

We believe this proposal demonstrates our commitment to delivering exceptional results for your organization.

NEXT STEPS:
Please review the attached proposal at your convenience. We're happy to schedule a call to discuss any questions you may have or to clarify any details.

Feel free to reach out to me directly at ${CONFIG.EMAIL.REPLY_TO} or ${CONFIG.BRANDING.PHONE}.

We look forward to the opportunity to work with you!

Best regards,
${CONFIG.BRANDING.NAME}
${CONFIG.BRANDING.PHONE}
${CONFIG.BRANDING.WEBSITE}

---
Proposal ID: ${proposalNumber}
This proposal is confidential and intended solely for the addressee.
    `;
        return {
            to: clientEmail,
            subject: `Proposal: ${projectTitle} from ${CONFIG.BRANDING.NAME}`,
            htmlBody,
            plainText,
            attachments: [
                {
                    filename: `${proposalNumber}.pdf`,
                    content: proposalPdfBuffer,
                    contentType: 'application/pdf',
                },
            ],
            cc: CONFIG.EMAIL.CC_ADMIN && CONFIG.EMAIL.ADMIN_EMAIL ? [CONFIG.EMAIL.ADMIN_EMAIL] : undefined,
            replyTo: CONFIG.EMAIL.REPLY_TO,
        };
    }
}
