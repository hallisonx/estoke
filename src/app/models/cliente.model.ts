export interface Cliente {
  id: number;
  cpf: string;
  nome: string;
  dataNascimento: string;
  enderecoResidencial: string;
  enderecoTrabalho: string;
  telefone: string;
  ativo: boolean;
  dataCadastro: string;
}

export type NovoCliente = Omit<Cliente, 'id' | 'dataCadastro'>;
