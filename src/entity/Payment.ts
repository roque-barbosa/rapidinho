import { Field, Float, Int, ObjectType } from "type-graphql";
import { BaseEntity, CreateDateColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Client } from "./Client";

@ObjectType()
export class Payment extends BaseEntity{

    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @Field(() => String)
    @CreateDateColumn()
    createdAt = Date;

    @Field(() => Float)
    @CreateDateColumn()
    price = Float;
 
    @Field(() => Client)
    @ManyToOne(() => Client, client => client.payments, {onDelete: 'SET NULL', onUpdate: 'CASCADE', cascade:true, eager: true})
    clients: Client;
}