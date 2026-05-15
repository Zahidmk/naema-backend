import { defineWidgetConfig } from "@medusajs/admin-sdk"
import {
  Container,
  Heading,
  Text,
  Switch,
  Badge,
  Label,
  Input,
} from "@medusajs/ui"
import { useState, useEffect } from "react"
import type { DetailWidgetProps, AdminProduct } from "@medusajs/framework/types"

/**
 * Show in Handpicked Favorites Widget
 *
 * Toggles `metadata.featured` on the product. The storefront homepage's
 * "Handpicked Favorites" section pulls products where this flag is true.
 *
 * Optional `metadata.featured_badge` (e.g. "Trending", "New") is rendered
 * as the badge label on each homepage tile.
 */
const FeaturedProductWidget = ({
  data: product,
}: DetailWidgetProps<AdminProduct>) => {
  const meta = ((product as any)?.metadata || {}) as {
    featured?: boolean | string
    featured_badge?: string | null
  }

  const [enabled, setEnabled] = useState<boolean>(
    meta.featured === true || meta.featured === "true"
  )
  const [badge, setBadge] = useState<string>(meta.featured_badge || "")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const m = ((product as any)?.metadata || {}) as {
      featured?: boolean | string
      featured_badge?: string | null
    }
    setEnabled(m.featured === true || m.featured === "true")
    setBadge(m.featured_badge || "")
  }, [
    (product as any)?.metadata?.featured,
    (product as any)?.metadata?.featured_badge,
  ])

  const persist = async (payload: {
    featured?: boolean
    featured_badge?: string | null
  }) => {
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const res = await fetch(`/admin/products/${product.id}/featured`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || `HTTP ${res.status}`)
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err: any) {
      console.error("[Featured] Save error:", err)
      setError(err.message || "Failed to save")
      throw err
    } finally {
      setSaving(false)
    }
  }

  const toggle = async (nextValue: boolean) => {
    const previous = enabled
    setEnabled(nextValue)
    try {
      await persist({ featured: nextValue })
    } catch {
      setEnabled(previous)
    }
  }

  const saveBadge = async () => {
    const value = badge.trim() || null
    try {
      await persist({ featured_badge: value })
    } catch {
      /* error already surfaced */
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-x-2">
          <span className="text-lg">⭐</span>
          <Heading level="h2" className="text-ui-fg-base inter-small-semibold">
            Handpicked Favorites
          </Heading>
        </div>
        {saved && (
          <Badge color="green" size="small">
            Saved ✓
          </Badge>
        )}
        {saving && (
          <Badge color="grey" size="small">
            Saving…
          </Badge>
        )}
      </div>

      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-1">
            <Label
              htmlFor="featured-toggle"
              className="text-ui-fg-base font-medium"
            >
              Show on homepage
            </Label>
            <Text className="text-ui-fg-subtle text-xs">
              {enabled
                ? "This product appears in the Handpicked Favorites section."
                : "Hidden from the Handpicked Favorites section."}
            </Text>
          </div>
          <Switch
            id="featured-toggle"
            checked={enabled}
            onCheckedChange={toggle}
            disabled={saving}
          />
        </div>
      </div>

      <div className="px-6 py-4 flex flex-col gap-y-2">
        <Label htmlFor="featured-badge" className="text-ui-fg-base font-medium">
          Badge label
        </Label>
        <Text className="text-ui-fg-subtle text-xs">
          Optional. Shown on the homepage tile. Examples: Trending, New, Best Seller.
        </Text>
        <div className="flex items-center gap-x-2">
          <Input
            id="featured-badge"
            placeholder="Trending"
            value={badge}
            onChange={(e) => setBadge(e.target.value)}
            disabled={saving || !enabled}
          />
          <button
            type="button"
            onClick={saveBadge}
            disabled={saving || !enabled}
            className="px-3 py-2 text-xs font-medium rounded-md bg-ui-button-neutral hover:bg-ui-button-neutral-hover text-ui-fg-base border border-ui-border-base disabled:opacity-50"
          >
            Save
          </button>
        </div>
        {error && (
          <Text className="text-ui-fg-error text-xs mt-1">⚠ {error}</Text>
        )}
      </div>

      <div className="px-6 py-3 flex items-center gap-x-2">
        <div
          className={`w-2 h-2 rounded-full ${
            enabled ? "bg-green-500" : "bg-gray-300"
          }`}
        />
        <Text className="text-ui-fg-subtle text-xs">
          {enabled ? "Live on homepage" : "Not featured"}
        </Text>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.side.before",
})

export default FeaturedProductWidget
