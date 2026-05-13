"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFirebaseApp = getFirebaseApp;
exports.sendPushNotification = sendPushNotification;
const admin = __importStar(require("firebase-admin"));
let app = null;
/**
 * Initialize Firebase Admin SDK (singleton)
 * Credentials loaded from environment variables — never hardcoded
 */
function getFirebaseApp() {
    if (app)
        return app;
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    if (!projectId || !clientEmail || !privateKey) {
        throw new Error("Missing Firebase credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in .env");
    }
    // Avoid re-initializing if already done (e.g. hot reload)
    if (admin.apps.length > 0) {
        app = admin.apps[0];
        return app;
    }
    app = admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    });
    console.log("[Firebase] Admin SDK initialized for project:", projectId);
    return app;
}
/**
 * Send a push notification to a single FCM device token
 */
async function sendPushNotification({ fcmToken, title, body, data = {}, }) {
    try {
        const firebaseApp = getFirebaseApp();
        const messaging = admin.messaging(firebaseApp);
        await messaging.send({
            token: fcmToken,
            notification: { title, body },
            data,
            android: {
                priority: "high",
                notification: { sound: "default", channelId: "orders" },
            },
            apns: {
                payload: { aps: { sound: "default", badge: 1 } },
            },
        });
        console.log(`[FCM] Push sent: "${title}"`);
        return true;
    }
    catch (error) {
        // Token expired/invalid — log but don't crash
        if (error.code === "messaging/invalid-registration-token" ||
            error.code === "messaging/registration-token-not-registered") {
            console.warn("[FCM] Invalid/expired token — should be removed from DB");
        }
        else {
            console.error("[FCM] Send error:", error.message);
        }
        return false;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlyZWJhc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGliL2ZpcmViYXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBUUEsd0NBeUJDO0FBS0Qsb0RBMENDO0FBaEZELHNEQUF3QztBQUV4QyxJQUFJLEdBQUcsR0FBeUIsSUFBSSxDQUFDO0FBRXJDOzs7R0FHRztBQUNILFNBQWdCLGNBQWM7SUFDNUIsSUFBSSxHQUFHO1FBQUUsT0FBTyxHQUFHLENBQUM7SUFFcEIsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQztJQUNsRCxNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDO0lBQ3RELE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLEVBQUUsT0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztJQUUzRSxJQUFJLENBQUMsU0FBUyxJQUFJLENBQUMsV0FBVyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDOUMsTUFBTSxJQUFJLEtBQUssQ0FDYiw0R0FBNEcsQ0FDN0csQ0FBQztJQUNKLENBQUM7SUFFRCwwREFBMEQ7SUFDMUQsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUMxQixHQUFHLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUUsQ0FBQztRQUNyQixPQUFPLEdBQUcsQ0FBQztJQUNiLENBQUM7SUFFRCxHQUFHLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQztRQUN4QixVQUFVLEVBQUUsS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxDQUFDO0tBQzFFLENBQUMsQ0FBQztJQUVILE9BQU8sQ0FBQyxHQUFHLENBQUMsK0NBQStDLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDeEUsT0FBTyxHQUFHLENBQUM7QUFDYixDQUFDO0FBRUQ7O0dBRUc7QUFDSSxLQUFLLFVBQVUsb0JBQW9CLENBQUMsRUFDekMsUUFBUSxFQUNSLEtBQUssRUFDTCxJQUFJLEVBQ0osSUFBSSxHQUFHLEVBQUUsR0FNVjtJQUNDLElBQUksQ0FBQztRQUNILE1BQU0sV0FBVyxHQUFHLGNBQWMsRUFBRSxDQUFDO1FBQ3JDLE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUM7UUFFL0MsTUFBTSxTQUFTLENBQUMsSUFBSSxDQUFDO1lBQ25CLEtBQUssRUFBRSxRQUFRO1lBQ2YsWUFBWSxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRTtZQUM3QixJQUFJO1lBQ0osT0FBTyxFQUFFO2dCQUNQLFFBQVEsRUFBRSxNQUFNO2dCQUNoQixZQUFZLEVBQUUsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUU7YUFDeEQ7WUFDRCxJQUFJLEVBQUU7Z0JBQ0osT0FBTyxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUU7YUFDakQ7U0FDRixDQUFDLENBQUM7UUFFSCxPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBQzNDLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUFDLE9BQU8sS0FBVSxFQUFFLENBQUM7UUFDcEIsOENBQThDO1FBQzlDLElBQ0UsS0FBSyxDQUFDLElBQUksS0FBSyxzQ0FBc0M7WUFDckQsS0FBSyxDQUFDLElBQUksS0FBSyw2Q0FBNkMsRUFDNUQsQ0FBQztZQUNELE9BQU8sQ0FBQyxJQUFJLENBQUMseURBQXlELENBQUMsQ0FBQztRQUMxRSxDQUFDO2FBQU0sQ0FBQztZQUNOLE9BQU8sQ0FBQyxLQUFLLENBQUMsbUJBQW1CLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3BELENBQUM7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7QUFDSCxDQUFDIn0=