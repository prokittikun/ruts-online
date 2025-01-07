/**
 * @param total
 * @param perPage
 * @param currentPage
 * @returns
 *
 */
export default function paginationCalculator(
  total: number,
  perPage: number,
  currentPage: number,
) {
  const data = {
    skips: perPage * currentPage - perPage,
    totalPages: Math.ceil(total / perPage),
    limit: perPage,
  };
  return data;
}
