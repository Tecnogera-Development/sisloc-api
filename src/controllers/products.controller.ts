import { RequestHandler } from 'express';
import * as productsService from '../services/products.service';

export const getProducts: RequestHandler = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const search = req.query.search as string;
    const lastUpdateDate = req.query.lastUpdateDate as string;

    if (page < 1) {
      return res.status(400).json({ 
        error: 'Página deve ser maior que 0',
        data: null
      });
    }

    if (limit < 1 || limit > 100) {
      return res.status(400).json({ 
        error: 'Limite deve ser entre 1 e 100',
        data: null 
      });
    }

    if (lastUpdateDate) {
      const date = new Date(lastUpdateDate);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ 
          error: 'Data inválida. Use formato ISO: YYYY-MM-DD',
          data: null
        });
      }
    }


    const data = await productsService.getProducts({ page, limit, search, lastUpdateDate });

    res.status(200).json({
      error: null,
      data: data.result,
      count: data.total
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'Erro ao buscar produtos',
      data: null,
    });
  }
};
