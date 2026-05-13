"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
/**
 * GET /store/pages
 * Returns list of available static pages
 */
async function GET(req, res) {
    res.json({
        pages: [
            { slug: "about", title: "About MarqaSouq", title_ar: "عن ماركة سوق" },
            { slug: "privacy-policy", title: "Privacy Policy", title_ar: "سياسة الخصوصية" },
            { slug: "terms-and-conditions", title: "Terms & Conditions", title_ar: "الشروط والأحكام" },
            { slug: "return-policy", title: "Return Policy", title_ar: "سياسة الإرجاع" },
            { slug: "shipping-policy", title: "Shipping Policy", title_ar: "سياسة الشحن" },
            { slug: "contact-us", title: "Contact Us", title_ar: "اتصل بنا" },
        ],
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL3BhZ2VzL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBTUEsa0JBV0M7QUFmRDs7O0dBR0c7QUFDSSxLQUFLLFVBQVUsR0FBRyxDQUFDLEdBQWtCLEVBQUUsR0FBbUI7SUFDL0QsR0FBRyxDQUFDLElBQUksQ0FBQztRQUNQLEtBQUssRUFBRTtZQUNMLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsaUJBQWlCLEVBQUUsUUFBUSxFQUFFLGNBQWMsRUFBRTtZQUNyRSxFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxLQUFLLEVBQUUsZ0JBQWdCLEVBQUUsUUFBUSxFQUFFLGdCQUFnQixFQUFFO1lBQy9FLEVBQUUsSUFBSSxFQUFFLHNCQUFzQixFQUFFLEtBQUssRUFBRSxvQkFBb0IsRUFBRSxRQUFRLEVBQUUsaUJBQWlCLEVBQUU7WUFDMUYsRUFBRSxJQUFJLEVBQUUsZUFBZSxFQUFFLEtBQUssRUFBRSxlQUFlLEVBQUUsUUFBUSxFQUFFLGVBQWUsRUFBRTtZQUM1RSxFQUFFLElBQUksRUFBRSxpQkFBaUIsRUFBRSxLQUFLLEVBQUUsaUJBQWlCLEVBQUUsUUFBUSxFQUFFLGFBQWEsRUFBRTtZQUM5RSxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFO1NBQ2xFO0tBQ0YsQ0FBQyxDQUFBO0FBQ0osQ0FBQyJ9