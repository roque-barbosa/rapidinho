import { Field, Float, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Client } from "./Client";

export enum TypePayment{
    ONLINE,
    CASH
}

@ObjectType()
@Entity()
export class Payment extends BaseEntity{

    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @Field(() => String)
    @CreateDateColumn()
    createdAt = Date;

    @Field(() => Float)
    @Column()
    price: number;

    @Field(() => Int)
    @Column()
    type: TypePayment;

    @Field(() => Client)
    @ManyToOne(() => Client, client => client.payments, {onDelete: 'SET NULL', onUpdate: 'CASCADE', cascade:true, eager: true})
    client: Client;
}