export interface Produto {
  id: number;
  nome: string;
  cor: string;
  tamanho: string;
  genero: string;
  peso: number;
  tipoTecido: string;
  fabricanteId: number;
  gramatura: number;
  codigoBarras: string;
  qrCode: string;
  detalhes: string;
  valorCompra: number;
  valorVenda: number;
  valorPromocional: number;
  quantidadeEstoque: number;
  ativo: boolean;
}

export type NovoProduto = Omit<Produto, 'id'>;

export type ProdutoFormulario = Omit<NovoProduto, 'fabricanteId'> & {
  fabricanteId: number | null;
};
