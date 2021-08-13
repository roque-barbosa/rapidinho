import { validateEmail } from "./validateEmail"
import {cpf} from 'cpf-cnpj-validator'
import clientRepo from '../repo/ClientRepo'

export const validateClientUpdate = async (userName: String, email: string, phone: string, cpf_num: string) => {
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

    if(phone.length != 11){
        return [{
                field: 'phone',
                message: "Invalid phone number"
            }]
    }

    
    if ( !(await clientRepo.getClientByCpf(cpf_num)) ) {
        return [{
            field: 'cpf',
            message: "cpf already registered"
        }]
    }
    if ( !(await clientRepo.getClientByEmail(email)) ) {
        return [{
            field: 'email',
            message: "Email already registered"
        }]
    }

    return null
}