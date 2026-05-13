"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
// Public endpoint to return the publishable key for client-side store fetches.
// This returns the key that is safe to expose to frontend clients (publishable keys are intended for public use).
async function GET(req, res) {
    try {
        const key = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || process.env.MEDUSA_PUBLISHABLE_KEY || null;
        if (!key)
            return res.status(404).json({ message: 'No publishable key configured' });
        res.json({ publishable_key: key });
    }
    catch (e) {
        console.error('Publishable key endpoint error', e);
        res.status(500).json({ message: 'Failed to retrieve publishable key' });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL3B1Ymxpc2hhYmxlLWtleS9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUlBLGtCQVNDO0FBWEQsK0VBQStFO0FBQy9FLGtIQUFrSDtBQUMzRyxLQUFLLFVBQVUsR0FBRyxDQUFDLEdBQWtCLEVBQUUsR0FBbUI7SUFDL0QsSUFBSSxDQUFDO1FBQ0gsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQ0FBa0MsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixJQUFJLElBQUksQ0FBQTtRQUN4RyxJQUFJLENBQUMsR0FBRztZQUFFLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsK0JBQStCLEVBQUUsQ0FBQyxDQUFBO1FBQ25GLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxlQUFlLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQTtJQUNwQyxDQUFDO0lBQUMsT0FBTyxDQUFNLEVBQUUsQ0FBQztRQUNoQixPQUFPLENBQUMsS0FBSyxDQUFDLGdDQUFnQyxFQUFFLENBQUMsQ0FBQyxDQUFBO1FBQ2xELEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLG9DQUFvQyxFQUFFLENBQUMsQ0FBQTtJQUN6RSxDQUFDO0FBQ0gsQ0FBQyJ9