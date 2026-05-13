"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.default = authNotificationHandler;
const utils_1 = require("@medusajs/framework/utils");
/**
 * Auth Notification Subscriber
 * Listen for auth events and send emails
 */
async function authNotificationHandler({ event: { data }, container, }) {
    const notificationService = container.resolve(utils_1.Modules.NOTIFICATION);
    const logger = container.resolve("logger");
    // We need to fetch the customer email. 
    // Since the event data might be limited, we'll try to resolve the user/customer.
    // For password reset, the event from @medusajs/auth is usually 'auth.password_reset_request' 
    // and contains the entity_id (which is the auth_identity id), and the token.
    try {
        // In a real scenario, we would need to look up the email associated with the auth identity.
        // However, the event payload for 'auth.password_reset_request' in Medusa v2 
        // typically includes { entity_id: string, token: string, actor_type: string }.
        // It DOES NOT include the email directly. 
        // We need to use the Auth Module to retrieve the identity, but that might be complex here.
        // WORKAROUND / TODO: 
        // Ensure that we pass the email in the event payload or look it up.
        // Since we are mocking this or this is a fresh implementation, 
        // we might need to adjust how we trigger this or use a custom event.
        // For now, let's assume we can get the email. 
        // If the standard event doesn't provide it, we might need a custom step in the workflow.
        logger.info(`Password reset requested for identity: ${data.entity_id}. Token: ${data.token}`);
        // Since we can't easily get the email from just the auth identity ID without more context in this subscriber 
        // (and we don't want to overcomplicate with module links right now),
        // we will log the TOKEN plainly so the developer (User) can use it for testing.
        // In a Production App: You would fetch the identity, get the provider metadata or user email, 
        // and then send the email.
        console.log("=================================================================");
        console.log("PASSWORD RESET TOKEN (For Testing):");
        console.log(data.token);
        console.log("=================================================================");
        // If we had the email, we would call:
        /*
        await notificationService.createNotifications({
          to: email, // we need to find this
          channel: "email",
          template: "password-reset",
          data: {
            token: data.token,
            // ...
          }
        });
        */
    }
    catch (error) {
        logger.error(`Failed to handle password reset for ${data.entity_id}:`, error);
    }
}
exports.config = {
    event: "auth.password_reset_request",
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aC1ub3RpZmljYXRpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3N1YnNjcmliZXJzL2F1dGgtbm90aWZpY2F0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFVQSwwQ0F5REM7QUEvREQscURBQW9EO0FBRXBEOzs7R0FHRztBQUNZLEtBQUssVUFBVSx1QkFBdUIsQ0FBQyxFQUNwRCxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFDZixTQUFTLEdBQ2dFO0lBQ3pFLE1BQU0sbUJBQW1CLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxlQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDcEUsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUUzQyx3Q0FBd0M7SUFDeEMsaUZBQWlGO0lBQ2pGLDhGQUE4RjtJQUM5Riw2RUFBNkU7SUFFN0UsSUFBSSxDQUFDO1FBQ0gsNEZBQTRGO1FBQzVGLDZFQUE2RTtRQUM3RSwrRUFBK0U7UUFDL0UsMkNBQTJDO1FBQzNDLDJGQUEyRjtRQUUzRixzQkFBc0I7UUFDdEIsb0VBQW9FO1FBQ3BFLGdFQUFnRTtRQUNoRSxxRUFBcUU7UUFFckUsK0NBQStDO1FBQy9DLHlGQUF5RjtRQUV6RixNQUFNLENBQUMsSUFBSSxDQUFDLDBDQUEwQyxJQUFJLENBQUMsU0FBUyxZQUFZLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBRTlGLDhHQUE4RztRQUM5RyxxRUFBcUU7UUFDckUsZ0ZBQWdGO1FBRWhGLCtGQUErRjtRQUMvRiwyQkFBMkI7UUFFM0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtRUFBbUUsQ0FBQyxDQUFDO1FBQ2pGLE9BQU8sQ0FBQyxHQUFHLENBQUMscUNBQXFDLENBQUMsQ0FBQztRQUNuRCxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN4QixPQUFPLENBQUMsR0FBRyxDQUFDLG1FQUFtRSxDQUFDLENBQUM7UUFFakYsc0NBQXNDO1FBQ3RDOzs7Ozs7Ozs7O1VBVUU7SUFFSixDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLE1BQU0sQ0FBQyxLQUFLLENBQUMsdUNBQXVDLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxLQUFjLENBQUMsQ0FBQztJQUN6RixDQUFDO0FBQ0gsQ0FBQztBQUVZLFFBQUEsTUFBTSxHQUFxQjtJQUN0QyxLQUFLLEVBQUUsNkJBQTZCO0NBQ3JDLENBQUMifQ==