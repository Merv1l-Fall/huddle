import { verifyRequest } from "@/lib/auth";
import { db } from "@/lib/firebase-admin";
import { z } from "zod";

const searchInviteUsersSchema = z.object({
	groupId: z.string().min(1, "Group ID is required"),
	query: z.string().trim().max(20).optional().default(""),
});

const groupInviteDataSchema = z.object({
	memberIds: z.array(z.string()).optional().default([]),
	invitedUsers: z.array(z.string()).optional().default([]),
});

export async function GET(req: Request) {
	try {
		const decodedToken = await verifyRequest(req);
		const uid = decodedToken.uid;

		const { searchParams } = new URL(req.url);
		const parsedParams = searchInviteUsersSchema.safeParse({
			groupId: searchParams.get("groupId") ?? "",
			query: searchParams.get("query") ?? "",
		});

		if (!parsedParams.success) {
			return Response.json(
				{ error: "Validation failed", details: z.treeifyError(parsedParams.error) },
				{ status: 400 },
			);
		}

		const { groupId, query } = parsedParams.data;
		if (query.length === 0) {
			return Response.json({ candidates: [] }, { status: 200 });
		}

		const groupDoc = await db.collection("groups").doc(groupId).get();
		if (!groupDoc.exists) {
			return Response.json({ error: "Group not found" }, { status: 404 });
		}

		const groupDataResult = groupInviteDataSchema.safeParse(groupDoc.data());
		if (!groupDataResult.success) {
			return Response.json({ error: "Group data is invalid" }, { status: 500 });
		}

		const groupData = groupDataResult.data;
		if (!groupData.memberIds.includes(uid)) {
			return Response.json({ error: "You are not a member of this group" }, { status: 403 });
		}

		const excludedUserIds = new Set([...groupData.memberIds, ...groupData.invitedUsers]);

		const usersSnapshot = await db
			.collection("users")
			.orderBy("username")
			.startAt(query)
			.endAt(`${query}\uf8ff`)
			.limit(10)
			.get();

		const candidates = usersSnapshot.docs
			.map((doc) => ({
				id: doc.id,
				username: doc.data()?.username,
			}))
			.filter(
				(candidate): candidate is { id: string; username: string } =>
					typeof candidate.username === "string" &&
					candidate.username.length > 0 &&
					!excludedUserIds.has(candidate.id),
			)
			.map(({ id, username }) => ({ id, username }));

		return Response.json({ candidates }, { status: 200 });
	} catch (error) {
		if (error instanceof Error) {
			if (error.message.includes("No token")) {
				return Response.json({ error: "Unauthorized: No token provided" }, { status: 401 });
			}
			if (error.message.includes("Invalid or expired")) {
				return Response.json({ error: "Unauthorized: Invalid or expired token" }, { status: 401 });
			}
			return Response.json({ error: error.message }, { status: 500 });
		}

		return Response.json({ error: "An unexpected error occurred" }, { status: 500 });
	}
}
