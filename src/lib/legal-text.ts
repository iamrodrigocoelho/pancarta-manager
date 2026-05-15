export function generateLegalText(params: {
  dataValidade: string
  canalOferta: string
  ean: string
  codigoProduto: string
}): string {
  const { dataValidade, canalOferta, ean, codigoProduto } = params
  return `Promoção válida até ${dataValidade}. Oferta exclusiva ${canalOferta}, enquanto durarem os estoques. EAN: ${ean} | CÓD: ${codigoProduto}`
}
