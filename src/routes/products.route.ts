import { Router } from "express";
import * as productsController from '../controllers/products.controller'

const router = Router();

router.get('/', productsController.getProducts)

router.get('/:slug', productsController.getProduct)

router.post('/', productsController.addProduct)

export default router;