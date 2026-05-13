import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params
  const query = req.scope.resolve("query")

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
    })

    if (!products || products.length === 0) {
      return res.status(404).json({ message: "Product not found" })
    }

    const product = products[0]

    return res.json({ product })
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: (error as Error).message })
  }
}
