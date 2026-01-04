import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
/*
const healthCheck = (req, res) => {
    try {
        res.status(200).json(new ApiResponse(200, { message: "Api is Running..." }));
    } catch (error) {
        
    }
}
*/

const healthCheck = asyncHandler(async (req, res) => {
  res
    .status(200)
    .json(new ApiResponse(200, { message: "Healthcheck Api is running..." }));
});

export { healthCheck };
