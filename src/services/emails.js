import sgMail from "@sendgrid/mail";
import logger from "../lib/logger";
import { SENDGRID_API_KEY } from "../config/env";

sgMail.setApiKey(SENDGRID_API_KEY);

const templates = {
  onBoarding: "d-3bac575725324ab188c1bdaaf294caa7",
  internal: "d-ef2b523444cb4e75be12914d77e369d5",
};

export const sentRegistrationsEmail = async (
  to,
  username,
  password,
  from = "info@bip.al"
) => {
  try {
    const msg = {
      to,
      from: { name: "My Doctor", email: from },
      bcc: "example@gmail.com",
      templateId: templates.onBoarding,
      dynamicTemplateData: {
        username: username,
        password: password,
      },
    };
    const resp = await sgMail.send(msg);
    logger.info(`Email send to: ${to}`, { response: resp });
  } catch (error) {
    logger.error("error in sentRegistrationsEmail", { error: error.message() });
  }
};

// export const sentInternalRegistrationsEmail = async (to, username, password, from = 'info@bip.al') => {
//   try {
//     const msg = {
//       to,
//       from: { name: 'Bip Internal', email: from },
//       bcc: 'bipcourier@gmail.com',
//       templateId: templates.internal,
//       dynamicTemplateData: {
//         username: username,
//         password: password
//       }
//     }
//     const resp = await sgMail.send(msg)
//     logger.info(`Email send to: ${to}`, { response: resp })
//   } catch (error) {
//     logger.error('error in sentInternalRegistrationsEmail', { error: error.message() })
//   }
// }
