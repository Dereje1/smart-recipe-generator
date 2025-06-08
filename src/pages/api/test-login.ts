import { setCookie } from 'cookies-next';
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  setCookie('next-auth.session-token', 'fake-token', {
    req,
    res,
    maxAge: 60 * 60,
    path: '/',
  });

  res.status(200).json({ message: 'Mock login success' });
}
