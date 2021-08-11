import { validateEmail } from "./validateEmail"
import {cpf} from 'cpf-cnpj-validator'
import { Client } from "../entity/Client"

export const validateClientRegister = async (userName: String, email: string, password: string, phone: string, cpf_num: string) => {
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
    if (await Client.findOne({where:{cpf:cpf_num}})) {
        return [{
            field: 'cpf',
            message: "cpf already registered"
        }]
    }
    if (await Client.findOne({where:{email:email}})) {
        return [{
            field: 'email',
            message: "Email already registered"
        }]
    }

    return null
}