import { Router } from "express";
import * as groupsController from '../controllers/groups.controller'

const router = Router();

router.get('/', groupsController.getGroups)

router.get('/:slug', groupsController.getGroup)

export default router;