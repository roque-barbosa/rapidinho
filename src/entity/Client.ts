import {  ObjectType } from "type-graphql";
import { Entity, OneToMany} from "typeorm";
import { Run } from "./Run";
import bcryptjs from 'bcryptjs'
import { User } from "./User";
import { Payment } from "./Payment";
import { AvaliationTaxi } from "./AvaliationTaxi";
import { AvaliationClient } from "./AvaliationClient";

// Entity and schema definition
 
@ObjectType()
@Entity()
export class Client extends User {
    @OneToMany(() => Payment, payment => payment.client, {onDelete: 'SET NULL', onUpdate: 'CASCADE'})
    payments: Payment[]

    @OneToMany(() => AvaliationTaxi, avaliationTaxi => avaliationTaxi.client, {onDelete: 'SET NULL', onUpdate: 'CASCADE'})
    avaliationsTaxi: AvaliationTaxi[]

    @OneToMany(() => AvaliationClient, avaliationClient => avaliationClient.client, {onDelete: 'SET NULL', onUpdate: 'CASCADE'})
    avaliationClient: AvaliationClient[]

    @OneToMany(() => Run, run => run.client, {onDelete: 'SET NULL', onUpdate: 'CASCADE'})
    runs: Run[]
}

export async function hashPassword (pwd: string): Promise<string> {
    const salt = await bcryptjs.genSalt(10)
    return bcryptjs.hash(pwd, salt)
}

export async function verifyHash(pwd: string, haashedPwd: string): Promise<Boolean>{
    const result = bcryptjs.compare(pwd, haashedPwd)
    return result
}