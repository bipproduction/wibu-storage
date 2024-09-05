'use client'
import { Prisma } from "@prisma/client"

export class Token {
    static value = ""
    static setToken(token: string) {
        Token.value = token
    }
}

type UserType = {} & Prisma.UserGetPayload<{ select: { id: true, name: true, email: true } }>
export class User {
    static value = {} as UserType
    static setUser(user: UserType) {
        User.value = user
    }
}

export function TokenProfider({ user, token, children }: { user: UserType, token: string, children: React.ReactNode }) {
    Token.setToken(token)
    User.setUser(user)
    return <div>{children}</div>
}