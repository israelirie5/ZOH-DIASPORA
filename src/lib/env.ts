import { z } from "zod";

const serverSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.url(),
  RESEND_API_KEY: z.string().min(1).optional(),
  EMAIL_FROM: z.string().min(1).optional(),
});

export function serverEnv() {
  const result = serverSchema.safeParse(process.env);
  if (!result.success) {
    const invalidVariables = [
      ...new Set(
        result.error.issues
          .map((issue) => issue.path[0])
          .filter((key): key is string => typeof key === "string"),
      ),
    ];

    throw new Error(
      `Configuration serveur incomplète : ${invalidVariables.join(", ")}.`,
    );
  }

  return result.data;
}
