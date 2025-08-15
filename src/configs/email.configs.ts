import { z, TypeOf } from "zod";

export const emailEnv = z.object({
    EMAIL_CLIENT_ID: z.string(),
    EMAIL_CLIENT_SECRET: z.string(),
    EMAIL_REDIRECT_URIS: z.string(),
    EMAIL_REFRESH_TOKEN: z.string(),
});

export interface IEmailEnv extends TypeOf<typeof emailEnv> {}