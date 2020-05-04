import { NextApiHandler } from 'next';

const handler: NextApiHandler = (req, res) => {
  res.statusCode = 200;
  res.json({ data: 'GraphQL' });
}

export default handler;