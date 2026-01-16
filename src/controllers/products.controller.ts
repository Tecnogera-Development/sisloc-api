import { RequestHandler } from "express";
import * as productsService from "../services/products.service";
import { getProductsSchema } from "../validators/products.validator";

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

    res.status(500).json({
      error: "Erro ao buscar produtos",
      data: null,
    });
  }
};

export const getProduct: RequestHandler = async (req, res) => {
  try {
    const result = await productsService.getProduct(Number(req.params.slug));

    return res.status(200).json({
      error: null,
      data: result.result,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Erro ao buscar produtos",
      data: null,
    });
  }
};
