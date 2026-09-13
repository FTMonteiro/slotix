import type { Request, Response } from "express";
import { sendListSuccess } from "../../shared/utils/apiResponse";
import { searchService } from "./search.service";
import type { SearchQueryInput } from "./search.schema";

export const searchController = {
  async search(req: Request, res: Response) {
    const query = req.validatedQuery as unknown as SearchQueryInput;
    const { data, meta } = await searchService.search(query);
    sendListSuccess(res, data, meta);
  },
};
