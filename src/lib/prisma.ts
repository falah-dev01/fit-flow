import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
    return new PrismaClient()
}

declare global {
    var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

let prisma: ReturnType<typeof prismaClientSingleton>

if (process.env.NODE_ENV === 'production') {
    prisma = prismaClientSingleton()
} else {
    if (!global.prismaGlobal) {
        global.prismaGlobal = prismaClientSingleton()
    }
    prisma = global.prismaGlobal
}

export default prisma
