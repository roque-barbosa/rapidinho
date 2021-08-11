import { Field, Float, Int, ObjectType, registerEnumType} from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, PrimaryGeneratedColumn } from "typeorm";


// Enum and types definition

export enum UserType {
  CLIENT,
  MOTOTAXI,
  ADMIN
}
export enum SexType {
  MEN,
  WOMAN
}
registerEnumType(
  UserType,
  {
      name: 'UserType',
      description: 'If the user is Client or a Moto Taxi'
  }
)
registerEnumType(
  SexType,
  {
      name: 'SexType',
      description: 'If the user is men or woman'
  }
)

// Entity and schema definition
@ObjectType()
export class User extends BaseEntity {
  
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column({nullable: false})
  name: string;

  @Field(() => String)
  @Column({unique: true})
  email: string;

  @Field(() => String)
  @Column()
  hashed_password: string;

  @Field(() => String)
  @Column({unique: true})
  cpf: string;

  @Field(() => String)
  @Column()
  phone: string;

  @Field(() => SexType)
  @Column()
  sex: SexType;

  @Field(() => String)
  @Column()
  birthDate: Date;

  @Field(() => String, {nullable: true})
  @Column({nullable: true})
  profilePicLink: string;

  @Field(() => String)
  @Column({nullable: false, unique: true})
  nickName: string;

  @Field(() => Float)
  @Column({default: 5})
  score: number;

  @Field(() => Int)
  @Column({default: 0})
  avaliationsQuantity: number;

  @Field(() => String)
  @Column({default: UserType.CLIENT})
  userType: UserType

  @Field(() => String)
  @CreateDateColumn()
  createdAt = Date;

  @Field(() => String)
  @CreateDateColumn()
  updatedAt = Date;
}
