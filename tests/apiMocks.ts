import type { NextApiRequest } from 'next';
import { createMocks, RequestMethod } from 'node-mocks-http';

export function mockRequestResponse(method: RequestMethod = 'GET') {
  const {
    req,
    res,
  }: { req: NextApiRequest; res: any } = createMocks({ method });
  req.headers = {
    'Content-Type': 'application/json',
    'X-SESSION-TOKEN': 'authToken',
  };
  req.query = { gatewayID: `${'gatewayID'}` };
  return { req, res };
}