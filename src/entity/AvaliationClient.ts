import { Field, Float, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Client } from "./Client";
import { Taxi } from "./Taxi";

@ObjectType()
@Entity()
export class AvaliationClient extends BaseEntity{
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id: number;
    
    @Field(() => String)
    @CreateDateColumn()
    createdAt = Date;

    @Field(() => String)
    @Column()
    comment: string;

    @Field(() => Float)
    @Column()
    score: number;

    @Field(() => Client)
    @ManyToOne(() => Client, client => client.avaliationsTaxi, {onDelete: 'SET NULL', onUpdate: 'CASCADE', cascade:true, eager: true})
    client: Client;

    @Field(() => Taxi)
    @ManyToOne(() => Taxi, taxi => taxi.avaliationsTaxi, {onDelete: 'SET NULL', onUpdate: 'CASCADE', cascade:true, eager: true})
    taxi: Taxi;
}