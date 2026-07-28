"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyFatoorahClient = void 0;
const axios_1 = __importDefault(require("axios"));
const constants_1 = require("./constants");
class MyFatoorahClient {
    constructor(options) {
        const apiKey = options?.apiKey || process.env.MYFATOORAH_API_KEY || "";
        const baseUrl = options?.baseUrl || process.env.MYFATOORAH_API_URL || "https://apitest.myfatoorah.com";
        this.client = axios_1.default.create({
            baseURL: baseUrl,
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
        });
    }
    handleError(error) {
        if (axios_1.default.isAxiosError(error)) {
            const responseData = error.response?.data;
            console.error("[MyFatoorah API Error]", {
                status: error.response?.status,
                data: responseData,
                url: error.config?.url,
            });
            throw new Error(responseData?.Message || error.message);
        }
        console.error("[MyFatoorah Unknown Error]", error);
        throw error;
    }
    async executePayment(payload) {
        try {
            const { data } = await this.client.post(constants_1.MYFATOORAH_API.EXECUTE_PAYMENT, payload);
            if (!data.IsSuccess) {
                throw new Error(data.Message || "Failed to execute payment");
            }
            return data.Data;
        }
        catch (error) {
            this.handleError(error);
            throw error; // Unreachable, handleError throws, but TS needs it
        }
    }
    async getPaymentStatus(payload) {
        try {
            const { data } = await this.client.post(constants_1.MYFATOORAH_API.GET_PAYMENT_STATUS, payload);
            if (!data.IsSuccess) {
                throw new Error(data.Message || "Failed to get payment status");
            }
            return data.Data;
        }
        catch (error) {
            this.handleError(error);
            throw error;
        }
    }
    async makeRefund(payload) {
        try {
            const { data } = await this.client.post(constants_1.MYFATOORAH_API.REFUND, payload);
            if (!data.IsSuccess) {
                throw new Error(data.Message || "Failed to make refund");
            }
            return data.Data;
        }
        catch (error) {
            this.handleError(error);
            throw error;
        }
    }
}
exports.MyFatoorahClient = MyFatoorahClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL21vZHVsZXMvbXlmYXRvb3JhaC9jbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsa0RBQTRDO0FBQzVDLDJDQUE0QztBQVU1QyxNQUFhLGdCQUFnQjtJQUczQixZQUFZLE9BQStDO1FBQ3pELE1BQU0sTUFBTSxHQUFHLE9BQU8sRUFBRSxNQUFNLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsSUFBSSxFQUFFLENBQUE7UUFDdEUsTUFBTSxPQUFPLEdBQUcsT0FBTyxFQUFFLE9BQU8sSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixJQUFJLGdDQUFnQyxDQUFBO1FBRXRHLElBQUksQ0FBQyxNQUFNLEdBQUcsZUFBSyxDQUFDLE1BQU0sQ0FBQztZQUN6QixPQUFPLEVBQUUsT0FBTztZQUNoQixPQUFPLEVBQUU7Z0JBQ1AsYUFBYSxFQUFFLFVBQVUsTUFBTSxFQUFFO2dCQUNqQyxjQUFjLEVBQUUsa0JBQWtCO2FBQ25DO1NBQ0YsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUVPLFdBQVcsQ0FBQyxLQUFVO1FBQzVCLElBQUksZUFBSyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQzlCLE1BQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFBO1lBQ3pDLE9BQU8sQ0FBQyxLQUFLLENBQUMsd0JBQXdCLEVBQUU7Z0JBQ3RDLE1BQU0sRUFBRSxLQUFLLENBQUMsUUFBUSxFQUFFLE1BQU07Z0JBQzlCLElBQUksRUFBRSxZQUFZO2dCQUNsQixHQUFHLEVBQUUsS0FBSyxDQUFDLE1BQU0sRUFBRSxHQUFHO2FBQ3ZCLENBQUMsQ0FBQTtZQUNGLE1BQU0sSUFBSSxLQUFLLENBQUMsWUFBWSxFQUFFLE9BQU8sSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUE7UUFDekQsQ0FBQztRQUNELE9BQU8sQ0FBQyxLQUFLLENBQUMsNEJBQTRCLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFDbEQsTUFBTSxLQUFLLENBQUE7SUFDYixDQUFDO0lBRUQsS0FBSyxDQUFDLGNBQWMsQ0FBQyxPQUE4QjtRQUNqRCxJQUFJLENBQUM7WUFDSCxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBeUIsMEJBQWMsQ0FBQyxlQUFlLEVBQUUsT0FBTyxDQUFDLENBQUE7WUFDeEcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDcEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxJQUFJLDJCQUEyQixDQUFDLENBQUE7WUFDOUQsQ0FBQztZQUNELE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQTtRQUNsQixDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNmLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUE7WUFDdkIsTUFBTSxLQUFLLENBQUEsQ0FBQyxtREFBbUQ7UUFDakUsQ0FBQztJQUNILENBQUM7SUFFRCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsT0FBZ0M7UUFDckQsSUFBSSxDQUFDO1lBQ0gsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQTJCLDBCQUFjLENBQUMsa0JBQWtCLEVBQUUsT0FBTyxDQUFDLENBQUE7WUFDN0csSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDcEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxJQUFJLDhCQUE4QixDQUFDLENBQUE7WUFDakUsQ0FBQztZQUNELE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQTtRQUNsQixDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNmLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUE7WUFDdkIsTUFBTSxLQUFLLENBQUE7UUFDYixDQUFDO0lBQ0gsQ0FBQztJQUVELEtBQUssQ0FBQyxVQUFVLENBQUMsT0FBNkI7UUFDNUMsSUFBSSxDQUFDO1lBQ0gsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQXdCLDBCQUFjLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFBO1lBQzlGLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7Z0JBQ3BCLE1BQU0sSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSx1QkFBdUIsQ0FBQyxDQUFBO1lBQzFELENBQUM7WUFDRCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUE7UUFDbEIsQ0FBQztRQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7WUFDZixJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFBO1lBQ3ZCLE1BQU0sS0FBSyxDQUFBO1FBQ2IsQ0FBQztJQUNILENBQUM7Q0FDRjtBQXBFRCw0Q0FvRUMifQ==