import { Field, ObjectType, registerEnumType } from "type-graphql";
import {Entity, Column, OneToMany} from "typeorm";
import { AvaliationClient } from "./AvaliationClient";
import { AvaliationTaxi } from "./AvaliationTaxi";
import { Run } from "./Run";
import { User } from "./User";
import { Veicle } from "./Veicle";

// Enum and types definition

export enum TaxiStatus {
    AVAILABLE,
    UNAVAILABLE,
    BLOCKED
}

registerEnumType(
    TaxiStatus,
    {
        name: 'TaxiStatus',
        description: 'If the taxi is available, blocked or unavailable'
    }
)

// Entity and schema definition

@ObjectType()
@Entity()
export class Taxi extends User {

    @Field(() => TaxiStatus)
    @Column({default: TaxiStatus.BLOCKED})
    status: TaxiStatus;

    @Field(() => String)
    @Column()
    registrationNumber: string;

    @Field(() => String)
    @Column()
    cnh: string;

    @Field(() => String)
    @Column({nullable: true})
    docmentaion_link: string;

    @OneToMany(() => Veicle, veicle => veicle.taxi, {onDelete: "SET NULL", onUpdate: 'CASCADE'})
    veicles: Veicle[]

    @OneToMany(() => Run, run => run.taxi, {onDelete: "SET NULL", onUpdate: 'CASCADE'})
    runs: Run[]

    @OneToMany(() => AvaliationTaxi, avaliationTaxi => avaliationTaxi.taxi, {onDelete: "SET NULL", onUpdate: 'CASCADE'})
    avaliationsTaxi: AvaliationTaxi[]

    @OneToMany(() => AvaliationClient, avaliationClient => avaliationClient.taxi, {onDelete: "SET NULL", onUpdate: 'CASCADE'})
    avaliationClient: AvaliationClient[]
}