import { Router, Request, Response } from "express";
import productsRoute from './products.route'

const router = Router();

router.get('/ping', async (req: Request, res: Response) => {
  res.json({pong: true})
});

router.use('/products', productsRoute)

export default router;
