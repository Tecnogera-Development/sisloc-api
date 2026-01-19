import { RequestHandler } from "express";
import * as productsService from "../services/products.service";
import { addProductSchema, getProductSchema, getProductsSchema } from "../validators/products.validator";

export const getProducts: RequestHandler = async (req, res, next) => {
  try {
    const data = getProductsSchema.parse(req.query);

    const result = await productsService.getProducts(data);

    res.status(200).json({
      error: null,
      data: result,
    });
  } catch (err) {
    console.error(err);
    next(err)
  }
};

export const getProduct: RequestHandler = async (req, res, next) => {
  try {
    const data = getProductSchema.parse(req.params)

    const result = await productsService.getProduct(data.slug);

    return res.status(200).json({
      error: null,
      data: result.result,
    });
  } catch (err) {
    console.error(err);
    next(err)
  }
};

export const addProduct: RequestHandler = async (req, res, next) => {
  try {
    const data = addProductSchema.parse(req.body);

    const result = await productsService.insertProduct(data);

    res.status(201).json(result);

  } catch (error) {

    console.error("Erro ao adicionar produto:", error);
    next(error)
  }
}