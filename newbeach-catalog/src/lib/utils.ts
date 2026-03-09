import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    pendente: "Pendente",
    pago: "Pago / Separar",
    separando: "Em Separação",
    enviado: "Enviado",
    concluido: "Concluído",
    cancelado: "Cancelado",
  };
  return statusMap[status] || status;
};
