import { Field, ObjectType } from "type-graphql";
import {Entity, Column} from "typeorm";
import { User } from "./User";

export enum Area{
    ADMINISTRATOR,
    SECRETARY,
    TI
}

// Entity and schema definition

@ObjectType()
@Entity()
export class Employee extends User {
    @Field(() => String)
    @Column()
    area_atuation: Area;

    @Field(() => Boolean)
    @Column()
    active: boolean = true;
}