import { Payment, TypePayment } from "../entity/Payment";
import { getConnection, getManager } from "typeorm";
import ClientRepo from "./ClientRepo";

class PaymentRepo{
    async createPayment(price: number, id_client: number, type: TypePayment){
        const client = await ClientRepo.getClientById(id_client);
        const result = await getConnection().createQueryBuilder().insert().into(Payment).values({
            price: price,
            client: client,
            type: type
        }).execute();

        const payment = await Payment.findOne({where:{id:result.raw.insertId}});
        return payment;
    }

    async getPaymentYield(data_initial: string, data_final: string){
        //const payments = await getConnection().createQueryBuilder().select().from(Payment, "payment").where("payment.createdAt data_initial BETWEEN  AND data_final;", {data_initial, data_final});
        const entityManager = getManager();
        console.log(data_initial + " " + data_final);
        const someQuery = entityManager.query(
            `SELECT * FROM payment where createdAt BETWEEN date(?) AND date(?);`,
            [data_initial, data_final]
            );
        return someQuery;
    }
}

export default new PaymentRepo();