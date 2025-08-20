import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

interface EndorsementData {
  userEmail: string;
  endorserEmail: string;
  organization: string;
}

interface InviteData {
  inviteCode: string;
}

export const requestEndorsement = functions.https.onCall(
  async (data: EndorsementData, context: functions.https.CallableContext) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated"
      );
    }
    const { userEmail, endorserEmail, organization } = data;
    if (!userEmail || !endorserEmail || !organization) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required fields"
      );
    }
    try {
      const endorser = await admin
        .firestore()
        .collection("users")
        .where("email", "==", endorserEmail)
        .get();
      if (endorser.empty || !endorser.docs[0].data().verified) {
        throw new functions.https.HttpsError(
          "not-found",
          "Endorser not found or not verified"
        );
      }
      await admin.firestore().collection("endorsement_requests").add({
        userEmail,
        endorserEmail,
        organization,
        status: "pending",
        createdAt: new Date().toISOString(),
      });
      return { message: "Endorsement request sent" };
    } catch (error: any) {
      functions.logger.error("Error requesting endorsement:", error);
      throw new functions.https.HttpsError(
        "internal",
        `Failed to request endorsement: ${error.message || "Unknown error"}`
      );
    }
  }
);

export const verifyInviteCode = functions.https.onCall(
  async (data: InviteData, context: functions.https.CallableContext) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated"
      );
    }
    const { inviteCode } = data;
    if (!inviteCode) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Invite code is required"
      );
    }
    try {
      const inviteRef = admin
        .firestore()
        .collection("invites")
        .where("code", "==", inviteCode)
        .where("used", "==", false);
      const inviteSnap = await inviteRef.get();
      if (inviteSnap.empty) {
        throw new functions.https.HttpsError(
          "not-found",
          "Invalid or used invite code"
        );
      }
      const inviteDoc = inviteSnap.docs[0];
      await inviteDoc.ref.update({ used: true });
      return { message: "Invite code verified" };
    } catch (error: any) {
      functions.logger.error("Error verifying invite code:", error);
      throw new functions.https.HttpsError(
        "internal",
        `Failed to verify invite code: ${error.message || "Unknown error"}`
      );
    }
  }
);
