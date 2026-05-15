import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * GET /admin/products/:id/featured
 * Returns whether a product is flagged for the homepage "Handpicked Favorites".
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const pg = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const { id } = req.params

  try {
    const result = await pg.raw(
      `SELECT id, title, metadata FROM product WHERE id = ? AND deleted_at IS NULL`,
      [id]
    )

    if (!result.rows?.length) {
      return res.status(404).json({ message: "Product not found" })
    }

    const metadata = result.rows[0].metadata || {}

    res.json({
      product_id: id,
      featured: metadata.featured === true,
      featured_badge: metadata.featured_badge || null,
    })
  } catch (error: any) {
    console.error("[Featured] GET error:", error)
    res.status(500).json({ message: error.message })
  }
}

/**
 * POST /admin/products/:id/featured
 * Toggle `featured` (and optionally `featured_badge`) on product metadata.
 *
 * Body: { featured: boolean, featured_badge?: string }
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const pg = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const { id } = req.params
  const body = req.body as { featured?: boolean; featured_badge?: string | null }

  try {
    const result = await pg.raw(
      `SELECT id, metadata FROM product WHERE id = ? AND deleted_at IS NULL`,
      [id]
    )

    if (!result.rows?.length) {
      return res.status(404).json({ message: "Product not found" })
    }

    const currentMeta = result.rows[0].metadata || {}
    const updated = {
      ...currentMeta,
      ...(body.featured !== undefined && { featured: body.featured }),
      ...(body.featured_badge !== undefined && { featured_badge: body.featured_badge }),
    }

    await pg.raw(
      `UPDATE product SET metadata = ?::jsonb, updated_at = NOW() WHERE id = ?`,
      [JSON.stringify(updated), id]
    )

    console.log(
      `[Featured] Product ${id}: featured=${updated.featured} badge=${updated.featured_badge}`
    )

    res.json({
      success: true,
      product_id: id,
      featured: updated.featured === true,
      featured_badge: updated.featured_badge || null,
    })
  } catch (error: any) {
    console.error("[Featured] POST error:", error)
    res.status(500).json({ message: error.message })
  }
}
