import { RequestHandler } from "express";
import * as productsService from "../services/products.service";
import { addProductSchema, getProductSchema, getProductsSchema } from "../validators/products.validator";
import z from "zod";

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
    const data = getProductSchema.parse(req.params)

    const result = await productsService.getProduct(data.slug);

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

export const addProduct: RequestHandler = async (req, res) => {
  try {
    const data = addProductSchema.parse(req.body);

    const result = await productsService.insertProduct(data);

    res.status(201).json(result);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Erro de validação",
        errors: error,
      });
    }

    if (error instanceof Error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Erro ao adicionar produto:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno ao cadastrar produto",
    });
  }
}