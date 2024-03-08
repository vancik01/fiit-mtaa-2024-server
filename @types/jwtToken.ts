import { AccountType } from "@prisma/client";

export type UserDecodedData = {
    id: string;
    role: AccountType;
    iat: number;
    exp: number;
};
