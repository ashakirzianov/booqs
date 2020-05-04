import { createHandler } from '../../back';

export const config = {
  api: {
    bodyParser: false,
  },
}

export default createHandler('/api/graphql');
// export default (req: any, res: any) => {
//   res.status(200).json({ data: 'oops' });
// }