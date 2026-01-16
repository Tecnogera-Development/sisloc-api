import { RequestHandler } from "express";
import * as productsService from "../services/products.service";
import { getProductsSchema } from "../validators/products.validator";
import { ZodError } from "zod";

export const getProducts: RequestHandler = async (req, res) => {
  try {
    const data = getProductsSchema.parse(req.query);

    const result = await productsService.getProducts(data);

    res.status(200).json({
      error: null,
      data: result,
    });
  } catch (err) {
    console.error(err);

    if (err instanceof ZodError) {
      return res.status(400).json({ error: err, data: null });
    }

    res.status(500).json({
      error: "Erro ao buscar produtos",
      data: null,
    });
  }
};
