import type { RequestHandler } from "express";
import { success } from "../../utils/response";
import { getSettings } from "./setting.service";

export const getPublicSettings: RequestHandler = async (_request, response) => {
  success(response, await getSettings());
};
