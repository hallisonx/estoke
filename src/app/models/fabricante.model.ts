export interface Fabricante {
  id: number;
  nome: string;
  cnpj: string;
  estado: string;
  cidade: string;
  telefone: string;
}

export type NovoFabricante = Omit<Fabricante, 'id'>;
