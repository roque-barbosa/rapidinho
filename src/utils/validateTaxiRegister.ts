import { validateEmail } from "./validateEmail"
import {cpf} from 'cpf-cnpj-validator'
import { Taxi } from "../entity/Taxi"
import { validateregistrationNumber } from "./validateRegistrationNumber"

export const validateTaxiRegister = async (
  userName: String,
  email: string,
  password: string,
  phone: string,
  cpf_num: string,
  cnh_num: string,
  registration_number:string
  ) => {
    if(userName.length <= 2){
        return [{
                field: 'username',
                message: "length must be greater than 2"
            }]
    }

    if(!cpf.isValid(cpf_num)){
        return [{
                field: 'cpf',
                message: "Invalid CPF"
            }]
    }

    if(userName.includes('@')){
        return [{
                field: 'username',
                message: "Cannot includes an @"
            }]
    }

    if(!validateEmail(email)){
        return [{
                field: 'email',
                message: "Invalid Email"
            }]
    }

    if(!validateregistrationNumber(registration_number)){
      return [{
              field: 'registrationNumber',
              message: "Invalid registration number"
          }]
  }

    if(password.length <= 3){
        return [{
                field: 'password',
                message: "password must be greater than 2"
            }]
    }

    if(phone.length != 11){
        return [{
                field: 'phone',
                message: "Invalid phone number"
            }]
    }
    if(cnh_num.length != 11){
      return [{
              field: 'cnh',
              message: "Invalid cnh number"
          }]
  }
    if (await Taxi.findOne({where:{cpf:cpf_num}})) {
        return [{
            field: 'cpf',
            message: "cpf already registered"
        }]
    }
    if (await Taxi.findOne({where:{email:email}})) {
        return [{
            field: 'email',
            message: "Email already registered"
        }]
    }

    return null
}