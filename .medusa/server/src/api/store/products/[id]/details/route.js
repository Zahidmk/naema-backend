"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
const GET = async (req, res) => {
    const { id } = req.params;
    const query = req.scope.resolve("query");
    try {
        const { data: products } = await query.graph({
            entity: "product",
            filters: { id },
            fields: [
                "id",
                "title",
                "handle",
                "description",
                "status",
                "thumbnail",
                "images.*",
                "variants.*",
                "variants.prices.*",
                "options.*",
                "options.values.*",
                "categories.*",
                "tags.*",
                "metadata",
            ],
        });
        if (!products || products.length === 0) {
            return res.status(404).json({ message: "Product not found" });
        }
        const product = products[0];
        return res.json({ product });
    }
    catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
exports.GET = GET;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL3Byb2R1Y3RzL1tpZF0vZGV0YWlscy9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFTyxNQUFNLEdBQUcsR0FBRyxLQUFLLEVBQUUsR0FBa0IsRUFBRSxHQUFtQixFQUFFLEVBQUU7SUFDbkUsTUFBTSxFQUFFLEVBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUE7SUFDekIsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUE7SUFFeEMsSUFBSSxDQUFDO1FBQ0gsTUFBTSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsR0FBRyxNQUFNLEtBQUssQ0FBQyxLQUFLLENBQUM7WUFDM0MsTUFBTSxFQUFFLFNBQVM7WUFDakIsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFO1lBQ2YsTUFBTSxFQUFFO2dCQUNOLElBQUk7Z0JBQ0osT0FBTztnQkFDUCxRQUFRO2dCQUNSLGFBQWE7Z0JBQ2IsUUFBUTtnQkFDUixXQUFXO2dCQUNYLFVBQVU7Z0JBQ1YsWUFBWTtnQkFDWixtQkFBbUI7Z0JBQ25CLFdBQVc7Z0JBQ1gsa0JBQWtCO2dCQUNsQixjQUFjO2dCQUNkLFFBQVE7Z0JBQ1IsVUFBVTthQUNYO1NBQ0YsQ0FBQyxDQUFBO1FBRUYsSUFBSSxDQUFDLFFBQVEsSUFBSSxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQ3ZDLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsQ0FBQyxDQUFBO1FBQy9ELENBQUM7UUFFRCxNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFFM0IsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQTtJQUM5QixDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsS0FBSyxFQUFHLEtBQWUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFBO0lBQ3BHLENBQUM7QUFDSCxDQUFDLENBQUE7QUFwQ1ksUUFBQSxHQUFHLE9Bb0NmIn0=