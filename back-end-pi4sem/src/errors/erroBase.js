// Classe base para tratamento de erros da aplicação
class BaseError extends Error {
  constructor(mensagem = "Erro interno do servidor", status = 500) {
      super();
      this.message = mensagem;
      this.status = status;
  }
  // Envia resposta de erro formatada
  sendResponse(res) {
      res.status(this.status).send({
          mensagem: this.message,
          status: this.status
      });
  }
}
export default BaseError;