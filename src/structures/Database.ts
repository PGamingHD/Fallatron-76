
import {
    PrismaClient,
    Users
} from '@prisma/client';

export class Database {
    prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    //getBadUsers(id: string): Promise<Users | null> {
    //    return this.prisma.users.findFirst({where: {id} });
    //}

    //getAllBadUsers(id: string): Promise<Users[]> {
    //    return this.prisma.users.findMany({where: {id}});
    //}
}