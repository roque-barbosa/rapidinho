import { Client } from "../entity/Client"
import { Field, ObjectType } from "type-graphql"
import { Taxi } from "../entity/Taxi"

// If something unexpected happens, We'll gonna return
// a generic error with the error msg
@ObjectType()
export class GenericError {

  @Field(() => String)
  message: string
}

// If there is a error during creation or update
// of a user, being client or taxi, we return in what
// field the error has occurred, this Field error has
// message that says wy the error happened
@ObjectType()
export class FieldError {
  @Field(() => String)
  field: string

  @Field(() => String)
  message: string
}

// this response we'll come in two ways, if everything
// went okay, we'll have a Client instance to return,
// and errors will be null, if we have any errors, Client
// will be null and we will send a arrays de errors back
@ObjectType()
export class ResponseCreateOrUpdateClient{
    @Field(() => [FieldError], {nullable:true})
    errors?: FieldError[]

    @Field(() => Client, {nullable:true})
    client?: Client
}

// this response we'll come in two ways, if everything
// went okay, we'll have a Client instance to return,
// and errors will be null, if we have any errors, Client
// will be null and we will send a arrays de errors back
@ObjectType()
export class ResponseCreateOrUpdateTaxi{
    @Field(() => [FieldError], {nullable:true})
    errors?: FieldError[]

    @Field(() => Taxi, {nullable:true})
    taxi?: Taxi
}

@ObjectType()
export class updateFilesResponse {
  @Field(() => [FieldError], {nullable:true})
    errors?: FieldError[]

  @Field(() => String, {nullable:true})
  fileUrl?: string
}

@ObjectType()
export class TaxiResponse {
  @Field(() => String, {nullable:true})
  errors?: string

  @Field(() => [Taxi], {nullable:true})
  taxis?: Taxi[]
}