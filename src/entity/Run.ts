import { Field, Float, Int, ObjectType, registerEnumType } from "type-graphql";
import {Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, CreateDateColumn} from "typeorm";
import { Client } from "./Client";
import { Taxi } from "./Taxi";

// Enum and types definition

export enum RunPaymentType {
    CASH,
    CARD
}

export enum RunType {
    DELIVERY,
    TAXI
}

export enum RunStatus {
    PENDING,
    WAITING_TAXI,
    OPEN,
    CLOSED,
    CANCELED
}
export enum RunPaymentStatus {
    NOT_PAID,
    PAID
}

registerEnumType(
    RunType,
    {
        name: 'RunType',
        description: 'If the run is a deliery or a passenger'
    }
)

registerEnumType(
    RunStatus,
    {
        name: 'RunStatus',
        description: 'If a run has ended or not'
    }
)
registerEnumType(
    RunPaymentStatus,
    {
        name: 'RunPaymentStatus',
        description: 'If a run has been paid or not or not'
    }
)
registerEnumType(
    RunPaymentType,
    {
        name: 'RunPaymentType',
        description: 'If a run will be paid in cash or card'
    }
)

// Entity and schema definition

@ObjectType()
@Entity()
export class Run extends BaseEntity {

    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @Field(() => String)
    @CreateDateColumn()
    acceptedAt: Date;

    @Field(() => String)
    @CreateDateColumn()
    paidAt: Date;

    @Field(() => String)
    @Column()
    clientCordinates: string;

    @Field(() => String)
    @Column()
    destinyCordinates: string;

    @Field(() => Float)
    @Column()
    price: number;

    @Field(() => RunType)
    @Column()
    runType: RunType;

    @Field(() => RunPaymentType)
    @Column()
    runPaymentType: RunPaymentType;

    @Field(() => RunStatus)
    @Column({default: RunStatus.PENDING})
    runStatus: RunStatus;

    @Field(() => Int)
    @Column({default: RunPaymentStatus.NOT_PAID})
    runPaymentStatus: RunPaymentStatus;

    @Field(() => Int)
    @Column({default: RunPaymentStatus.NOT_PAID})
    runSystemPaymentStatus: number;

    @Field(() => Client) 
    @ManyToOne(() => Client, client => client.runs, {onDelete: 'SET NULL', onUpdate: 'CASCADE', cascade:true, eager: true})
    client: Client;

    @Field(() => Taxi)
    @ManyToOne(() => Taxi, taxi => taxi.runs, {onDelete: 'SET NULL', onUpdate: 'CASCADE', cascade: false, eager: true})
    taxi: Taxi;

}