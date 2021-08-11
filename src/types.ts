import {Request, Response} from 'express'
import { Redis } from 'ioredis'

export type MyContext = {
    req: Request;
    res: Response;
    redis: Redis,
    // userLoader: ReturnType<typeof createUserLoader>;
    // updootLoader: ReturnType<typeof createUpdootLoader>;
}