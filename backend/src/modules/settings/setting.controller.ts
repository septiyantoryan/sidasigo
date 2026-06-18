import type { RequestHandler } from "express";
import { success } from "../../utils/response";
import { getSettings } from "./setting.service";
import { findAllHeroImages } from "./setting.repository";

export const getPublicSettings: RequestHandler = async (_request, response) => {
  success(response, await getSettings());
};

export const getPublicHeroImages: RequestHandler = async (_request, response) => {
  success(response, await findAllHeroImages());
};
