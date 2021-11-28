import sendgrid from '@sendgrid/mail';
import type FormValues from 'components/ContactForm/types';
import type { NextApiRequest, NextApiResponse } from 'next';
import buildEmailTemplate from 'pages/api/helpers';

sendgrid.setApiKey(process.env.SENDGRID_API_KEY ?? '');

const sendEmail = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const request: {
      body: FormValues;
    } = req;
    const subject = request.body.subject;
    await sendgrid.send({
      to: 'molina_nv@hotmail.com', // Your email where you'll receive emails
      from: 'molinamw@gmail.com', // your website email address here
      subject: `[Lead from molina.digital]: ${subject}`,
      html: buildEmailTemplate(request.body),
    });
    return res.status(200).json({ success: 'true' });
  } catch (error) {
    return res.status((error as { code: number }).code || 500).json({
      error: (
        error as { response: { body: { errors: { message: string }[] } } }
      ).response.body.errors
        .map((err) => err.message)
        .join(', '),
    });
  }
};

export default sendEmail;
