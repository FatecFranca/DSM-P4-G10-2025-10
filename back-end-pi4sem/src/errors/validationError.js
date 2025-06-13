// Classe para erros de validação de dados
import wrongRequisition from "./wrongRequisition.js";
class ValidationError extends wrongRequisition {
    constructor(erro) {
        // Extrai e formata mensagens de erro de validação
        const errormessages = Object.values(erro.errors)
        .map(erro => erro.message)
        .join("; ");
        super(`Houve um erro de validação de dados. ${errormessages}`);
    }
}
export default ValidationError;