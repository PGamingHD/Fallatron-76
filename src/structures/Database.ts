
import {
    PrismaClient,
    user,
    Order,
    OrderStatus,
    AccountType,
} from '@prisma/client';

export class Database {
    prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    registerNewUser(data: any) {
        return this.prisma.user.create({data});
    }

    registerNewUAccount(data: any) {
        return this.prisma.useraccount.create({data});
    }

    registerNewOrder(id: string, userid: string, user: string, pass: string, orderId: number, todo: string) {
        return this.prisma.order.create({
            data: {
                id,
                userid,
                user,
                pass,
                orderId,
                todo
            }
        });
    }

    validateUsername(username: string): Promise<user | null> {
        return this.prisma.user.findFirst({
            where: {
                username
            },
            include: {
                useraccount: true
            }
        });
    }

    findLoggedIn(userid: string) {
        return this.prisma.user.findFirst({
            where: {
                loggedinid: userid
            },
            include: {
                useraccount: true,
            }
        });
    }

    findUsername(username: string): Promise<user | null> {
        return this.prisma.user.findFirst({
            where: {
                username
            },
            include: {
                useraccount: true
            }
        })
    }

    findUserId(userid: string): Promise<user | null> {
        return this.prisma.user.findFirst({
            where: {
                userid
            }
        })
    }

    findLatestOrder(userid: string): Promise<Order[]> {
        return this.prisma.order.findMany({
            where: {
                userid
            },
            orderBy: [
                {
                   orderId: 'desc'
                }
            ],
            take: 1
        })
    }

    findAllOrders(access: string): Promise<Order[]> {
        return this.prisma.order.findMany({
            where: {
                access,
                status: 'PENDING'
            },
            orderBy: [
                {
                    userid: 'asc'
                },
                {
                    orderId: 'asc'
                },
            ],

        })
    }

    findAllOOrders(): Promise<Order[]> {
        return this.prisma.order.findMany({});
    }

    findOrder(id: string): Promise<Order | null> {
        return this.prisma.order.findFirst({
            where: {
                id
            }
        });
    }

    findAllUOrders(userid: string): Promise<Order[]> {
        return this.prisma.order.findMany({
            where: {
                userid,
                status: 'PENDING'
            }
        })
    }

    findAllSpecificUOrders(userid: string): Promise<Order[]> {
        return this.prisma.order.findMany({
            where: {
                userid
            }
        });
    }

    findSpecificOrder(userid: string, orderid: number): Promise<Order | null> {
        return this.prisma.order.findFirst({
            where: {
                userid,
                orderId: orderid
            }
        })
    }

    accountLogin(loginid: string, username: string) {
        return this.prisma.user.update({
            where: {
                username
            },
            data: {
                loggedinid: loginid,
                loggedin: true
            }
        });
    }

    accountLogout(username: string) {
        return this.prisma.user.update({
            where: {
                username
            },
            data: {
                loggedinid: null,
                loggedin: false
            }
        });
    }

    updateOrderStatus(id: string, status: OrderStatus) {
        return this.prisma.order.update({
            where: {
                id
            },
            data: {
                status
            }
        });
    }

    updateOrderCreds(id: string) {
        return this.prisma.order.update({
            where: {
                id
            },
            data: {
                user: 'REMOVED',
                pass: 'REMOVED',
            }
        });
    }

    updateOrderCredss(id: string, user: string, pass: string) {
        return this.prisma.order.update({
            where: {
                id
            },
            data: {
                user,
                pass,
            }
        });
    }

    updateOrderOpen(id: string, newNum: number) {
        return this.prisma.order.update({
            where: {
                id
            },
            data: {
                openTimes: newNum
            }
        })
    }

    updateUserPassword(id: string, newpass: string) {
        return this.prisma.user.update({
            where: {
                id
            },
            data: {
                password: newpass,
                loggedin: false,
                loggedinid: '0'
            }
        })
    }

    updateOrderAccess(id: string, access: string) {
        return this.prisma.order.update({
            where: {
                id
            },
            data: {
                access
            }
        });
    }

    updateUserType(id: string, type: AccountType) {
        return this.prisma.useraccount.update({
            where: {
                id
            },
            data: {
                type
            }
        })
    }

    delOrder(id: string) {
        return this.prisma.order.delete({
            where: {
                id
            }
        })
    }
}