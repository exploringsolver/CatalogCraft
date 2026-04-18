const nodemailer = require('nodemailer');

function createTransportFromConfig(mailCfg) {
  if (!mailCfg || mailCfg.transport === 'log') {
    return null;
  }

  return nodemailer.createTransport({
    host: mailCfg.smtp.host,
    port: mailCfg.smtp.port,
    secure: Boolean(mailCfg.smtp.secure),
    auth: mailCfg.smtp.user
      ? {
          user: mailCfg.smtp.user,
          pass: mailCfg.smtp.pass,
        }
      : undefined,
  });
}

async function sendMail({ mailCfg, to, subject, text, html }) {
  if (!to) {
    throw new Error('Missing notify "to" address');
  }

  if (!mailCfg || mailCfg.transport === 'log') {
    // eslint-disable-next-line no-console
    console.log('\n[CATALOGCRAFT ADMIN GATE] Email (log transport)\n', {
      to,
      subject,
      text,
    });
    return { logged: true };
  }

  const transport = createTransportFromConfig(mailCfg);
  if (!transport) {
    throw new Error('Mail transport not configured');
  }

  await transport.sendMail({
    from: mailCfg.from,
    to,
    subject,
    text,
    html,
  });

  return { sent: true };
}

module.exports = {
  sendMail,
};
