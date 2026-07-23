"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyFatoorahClient = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("./config"));
const constants_1 = require("./constants");
class MyFatoorahClient {
    constructor() {
        this.client = axios_1.default.create({
            baseURL: config_1.default.baseUrl,
            headers: {
                Authorization: `Bearer ${config_1.default.apiKey}`,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL21vZHVsZXMvbXlmYXRvb3JhaC9jbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsa0RBQTRDO0FBQzVDLHNEQUE2QjtBQUM3QiwyQ0FBNEM7QUFVNUMsTUFBYSxnQkFBZ0I7SUFHM0I7UUFDRSxJQUFJLENBQUMsTUFBTSxHQUFHLGVBQUssQ0FBQyxNQUFNLENBQUM7WUFDekIsT0FBTyxFQUFFLGdCQUFNLENBQUMsT0FBTztZQUN2QixPQUFPLEVBQUU7Z0JBQ1AsYUFBYSxFQUFFLFVBQVUsZ0JBQU0sQ0FBQyxNQUFNLEVBQUU7Z0JBQ3hDLGNBQWMsRUFBRSxrQkFBa0I7YUFDbkM7U0FDRixDQUFDLENBQUE7SUFDSixDQUFDO0lBRU8sV0FBVyxDQUFDLEtBQVU7UUFDNUIsSUFBSSxlQUFLLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDOUIsTUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUE7WUFDekMsT0FBTyxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsRUFBRTtnQkFDdEMsTUFBTSxFQUFFLEtBQUssQ0FBQyxRQUFRLEVBQUUsTUFBTTtnQkFDOUIsSUFBSSxFQUFFLFlBQVk7Z0JBQ2xCLEdBQUcsRUFBRSxLQUFLLENBQUMsTUFBTSxFQUFFLEdBQUc7YUFDdkIsQ0FBQyxDQUFBO1lBQ0YsTUFBTSxJQUFJLEtBQUssQ0FBQyxZQUFZLEVBQUUsT0FBTyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQUN6RCxDQUFDO1FBQ0QsT0FBTyxDQUFDLEtBQUssQ0FBQyw0QkFBNEIsRUFBRSxLQUFLLENBQUMsQ0FBQTtRQUNsRCxNQUFNLEtBQUssQ0FBQTtJQUNiLENBQUM7SUFFRCxLQUFLLENBQUMsY0FBYyxDQUFDLE9BQThCO1FBQ2pELElBQUksQ0FBQztZQUNILE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUF5QiwwQkFBYyxDQUFDLGVBQWUsRUFBRSxPQUFPLENBQUMsQ0FBQTtZQUN4RyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUNwQixNQUFNLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksMkJBQTJCLENBQUMsQ0FBQTtZQUM5RCxDQUFDO1lBQ0QsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFBO1FBQ2xCLENBQUM7UUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1lBQ2YsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQTtZQUN2QixNQUFNLEtBQUssQ0FBQSxDQUFDLG1EQUFtRDtRQUNqRSxDQUFDO0lBQ0gsQ0FBQztJQUVELEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFnQztRQUNyRCxJQUFJLENBQUM7WUFDSCxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBMkIsMEJBQWMsQ0FBQyxrQkFBa0IsRUFBRSxPQUFPLENBQUMsQ0FBQTtZQUM3RyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUNwQixNQUFNLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksOEJBQThCLENBQUMsQ0FBQTtZQUNqRSxDQUFDO1lBQ0QsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFBO1FBQ2xCLENBQUM7UUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1lBQ2YsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQTtZQUN2QixNQUFNLEtBQUssQ0FBQTtRQUNiLENBQUM7SUFDSCxDQUFDO0lBRUQsS0FBSyxDQUFDLFVBQVUsQ0FBQyxPQUE2QjtRQUM1QyxJQUFJLENBQUM7WUFDSCxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBd0IsMEJBQWMsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUE7WUFDOUYsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDcEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxJQUFJLHVCQUF1QixDQUFDLENBQUE7WUFDMUQsQ0FBQztZQUNELE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQTtRQUNsQixDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNmLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUE7WUFDdkIsTUFBTSxLQUFLLENBQUE7UUFDYixDQUFDO0lBQ0gsQ0FBQztDQUNGO0FBakVELDRDQWlFQyJ9