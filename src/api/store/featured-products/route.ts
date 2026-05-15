import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * GET /store/featured-products
 * Returns products flagged with metadata.featured === true.
 * Used by the storefront "Handpicked Favorites" homepage section.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const pg = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION) as any

  const limitRaw = (req.query?.limit as string) || "5"
  const limit = Math.max(1, Math.min(20, parseInt(limitRaw, 10) || 5))

  try {
    const query = `
      SELECT
        p.id, p.title, p.handle, p.thumbnail, p.metadata,
        (
          SELECT json_agg(json_build_object('id', pc.id, 'handle', pc.handle, 'name', pc.name))
          FROM product_category_product pcp
          JOIN product_category pc ON pc.id = pcp.product_category_id
          WHERE pcp.product_id = p.id AND pc.deleted_at IS NULL
        ) AS categories,
        (
          SELECT json_agg(json_build_object('id', t.id, 'value', t.value))
          FROM product_tags pt
          JOIN product_tag t ON t.id = pt.product_tag_id
          WHERE pt.product_id = p.id AND t.deleted_at IS NULL
        ) AS tags
      FROM product p
      WHERE p.deleted_at IS NULL
        AND p.status = 'published'
        AND (p.metadata->>'featured') = 'true'
      ORDER BY p.updated_at DESC
      LIMIT ?
    `

    const result = await pg.raw(query, [limit])
    const rows = result.rows || []

    const products = rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      handle: r.handle,
      thumbnail: r.thumbnail,
      metadata: r.metadata || {},
      categories: r.categories || [],
      tags: r.tags || [],
      featured_badge: (r.metadata && r.metadata.featured_badge) || null,
    }))

    res.json({ products, count: products.length })
  } catch (error: any) {
    console.error("[Featured Products] GET error:", error)
    res.status(500).json({ message: error.message, products: [] })
  }
}
