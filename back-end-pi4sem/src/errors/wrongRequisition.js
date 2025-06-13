// Classe para erros de requisição inválida (400)
import BaseError from "./erroBase.js";
class WrongRequisition extends BaseError {
    constructor(mensagem = "Um ou mais dados fornecidos estão incorretos") {
        super(mensagem, 400);
    }
}
export default WrongRequisition;