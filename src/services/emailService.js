/**
 * Email delivery service for activity reports.
 * Connect a real provider (SMTP, SendGrid, etc.) by implementing sendActivityReport.
 */

const EMAIL_SERVICE_CONFIGURED = false;

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

/**
 * @returns {Promise<{ success: boolean, error?: string, message?: string }>}
 */
export async function sendActivityReport({ to, periodLabel, district, state, activities }) {
  if (!isValidEmail(to)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  if (!EMAIL_SERVICE_CONFIGURED) {
    return {
      success: false,
      error: 'Email service is not configured. The report was not sent. Connect an email provider to enable sharing.'
    };
  }

  // Future integration point — example:
  // await fetch('/api/reports/email', { method: 'POST', body: JSON.stringify({ to, periodLabel, district, state, activities }) });

  return {
    success: true,
    message: `Activity report sent successfully to ${to.trim()}.`
  };
}

export { isValidEmail };
