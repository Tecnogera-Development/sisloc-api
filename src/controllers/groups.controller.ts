import { RequestHandler } from "express";
import * as groupsService from "../services/groups.service";
import { getGroupSchema, getGroupsSchema, postGroupSchema, putGroupsSchema } from "../validators/groups.validator";

export const getGroups: RequestHandler = async (req, res, next) => {
  try {
    const data = getGroupsSchema.parse(req.query);

    const result = await groupsService.getGroups(data);

    res.status(200).json({
      error: null,
      data: result,
    });
  } catch (err) {
    console.error(err);
    next(err)
  }
};

export const getGroup: RequestHandler = async (req, res, next) => {
  try {
    const data = getGroupSchema.parse(req.params)

    const result = await groupsService.getGroup(data.slug);

    return res.status(200).json({
      error: null,
      data: result.result,
    });
  } catch (err) {
    console.error(err);
    next(err)
  }
};

export const postGroup: RequestHandler = async (req, res, next) => {
  try {
      const data = postGroupSchema.parse(req.body)

      const result = await groupsService.postGroup(data)

      return res.status(201).json({
        error: null,
        data: result.result
      })
  } catch (err) {
    console.error(err)
    next(err)
  }
}

export const putGroup: RequestHandler = async (req, res, next) => {
  try {
    const data = putGroupsSchema.parse(req.body)

    const result = await groupsService.putGroup(data, Number(req.params.slug));

    return res.status(204).json({});
  } catch (err) {
    console.error(err);
    next(err)
  }
}