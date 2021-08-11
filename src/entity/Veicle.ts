import { Field, Int, ObjectType, registerEnumType} from "type-graphql";
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Taxi } from "./Taxi";

export enum VeicleType {
  CAR,
  MOTORCYCLE,
}

registerEnumType(
  VeicleType,
  {
      name: 'VeicleType',
      description: 'If the taxi is a car or a motorcycle'
  }
)

@ObjectType()
@Entity()
export class Veicle extends BaseEntity {

  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => VeicleType)
  @Column({default: VeicleType.MOTORCYCLE})
  veicleType: VeicleType;

  @Field(() => String)
  @Column()
  licensePlate: string;

  @Field(() => String)
  @Column()
  crvLink: string;

  @Field(() => String)
  @Column()
  model: string;

  @Field(() => String)
  @Column()
  color: string;

  @Field(() => Taxi)
  @ManyToOne(() => Taxi, taxi => taxi.veicles, {onDelete: 'SET NULL', onUpdate: 'CASCADE', cascade:true})
  taxi: Taxi;
}