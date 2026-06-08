import { contactSubmissionSchema } from "@/lib/validators/contact";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { submitContact } from "@/services/cms.service";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = rateLimit(`contact:${ip}`, 5, 60_000);
  if (!limit.allowed) {
    return apiError("RATE_LIMITED", "Too many requests. Try again later.", 429);
  }

  const body = await request.json();
  const parsed = contactSubmissionSchema.safeParse(body);

  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Invalid request body", 400, parsed.error.flatten());
  }

  const submission = await submitContact(parsed.data);
  return apiSuccess({ id: submission.id, message: "Message received" }, 201);
}
