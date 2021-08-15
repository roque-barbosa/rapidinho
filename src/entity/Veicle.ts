import { Field, Int, ObjectType, registerEnumType} from "type-graphql";
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Taxi } from "./Taxi";

export enum VeicleType {
  CAR,
  MOTORCYCLE,
}
export enum VeicleColor {
  RED,
  GREEN,
  BLUE,
  WHITE,
  BLACK,
  GREY,
  SILVER,
  BROWN,
  YELLOW

}

registerEnumType(
  VeicleType,
  {
      name: 'VeicleType',
      description: 'If the taxi is a car or a motorcycle'
  }
)
registerEnumType(
  VeicleColor,
  {
      name: 'VeicleColor',
      description: 'Color of the veicle'
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

  @Field(() => VeicleColor)
  @Column()
  color: VeicleColor;

  @Field(() => Taxi)
  @ManyToOne(() => Taxi, taxi => taxi.veicles, {onDelete: 'SET NULL', onUpdate: 'CASCADE', cascade:true})
  taxi: Taxi;
}