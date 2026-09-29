// Seller-center table: sticky header, pinned key column, sortable columns, row checkboxes, optional status filter.
// columns: [{ key, label, sortable?, render?(row) → HTML string (escape user text yourself), align? }]
import { escapeHtml } from "../core/format.js";
import { icon } from "./icons.js";

const INTERACTIVE = "input, select, button, a, label, textarea";

/**
 * Render into `container` and keep it interactive. Returns { setRows, getSelected }.
 * filter: optional { key, label, options: [{ value, label }] } — shows a <select> above the table.
 * rowClass(row) → extra class for a <tr>; onRowClick(row) → called when a row (not a control in it) is clicked.
 */
export function mountDataTable(container, {
  columns, rows, rowKey = "id", filter = null, caption = "", rowClass = () => "", onRowClick = null, emptyText = "표시할 주문이 없습니다.",
}) {
  const view = { rows, sortKey: null, sortDir: 1, filterValue: "", selected: new Set() };

  function visibleRows() {
    const list = view.filterValue ? view.rows.filter((r) => String(r[filter.key]) === view.filterValue) : [...view.rows];
    if (view.sortKey) list.sort((a, b) => String(a[view.sortKey]).localeCompare(String(b[view.sortKey]), "ko", { numeric: true }) * view.sortDir);
    return list;
  }

  function render() {
    const list = visibleRows();
    const allChecked = list.length > 0 && list.every((r) => view.selected.has(r[rowKey]));
    container.innerHTML = `
      ${filter ? `<label class="dt-filter">${escapeHtml(filter.label)}
        <select data-dt="filter"><option value="">전체</option>${filter.options.map((o) =>
          `<option value="${o.value}" ${o.value === view.filterValue ? "selected" : ""}>${escapeHtml(o.label)}</option>`).join("")}</select>
        <span class="dt-count">${list.length}건</span></label>` : ""}
      <div class="dt-scroll"><table class="dt">
        ${caption ? `<caption class="visually-hidden">${escapeHtml(caption)}</caption>` : ""}
        <thead><tr>
          <th class="dt__check"><input type="checkbox" class="checkbox" data-dt="all" aria-label="전체 선택" ${allChecked ? "checked" : ""}></th>
          ${columns.map((c) => `<th scope="col" ${view.sortKey === c.key ? `aria-sort="${view.sortDir > 0 ? "ascending" : "descending"}"` : ""}>
            ${c.sortable ? `<button type="button" class="dt__sort" data-sort="${c.key}">${escapeHtml(c.label)}${icon("sort", { size: 14 })}</button>` : escapeHtml(c.label)}</th>`).join("")}
        </tr></thead>
        <tbody>${list.map((r) => `<tr data-key="${escapeHtml(r[rowKey])}" class="${view.selected.has(r[rowKey]) ? "is-selected" : ""} ${rowClass(r)}">
          <td class="dt__check"><input type="checkbox" class="checkbox" data-dt="row" value="${escapeHtml(r[rowKey])}" aria-label="${escapeHtml(r[rowKey])} 선택" ${view.selected.has(r[rowKey]) ? "checked" : ""}></td>
          ${columns.map((c) => `<td class="${c.align === "right" ? "is-num" : ""}">${c.render ? c.render(r) : escapeHtml(r[c.key])}</td>`).join("")}
        </tr>`).join("") || `<tr><td class="dt__empty" colspan="${columns.length + 1}">${escapeHtml(emptyText)}</td></tr>`}</tbody>
      </table></div>`;
  }

  container.addEventListener("click", (e) => {
    const sortBtn = e.target.closest("[data-sort]");
    if (sortBtn) {
      const key = sortBtn.dataset.sort;
      view.sortDir = view.sortKey === key ? -view.sortDir : 1;
      view.sortKey = key;
      render();
      container.querySelector(`[data-sort="${key}"]`).focus();
      return;
    }
    const tr = e.target.closest("tbody tr[data-key]");
    if (onRowClick && tr && !e.target.closest(INTERACTIVE)) onRowClick(view.rows.find((r) => String(r[rowKey]) === tr.dataset.key));
  });
  container.addEventListener("change", (e) => {
    const t = e.target;
    if (!t.dataset.dt) return; // controls rendered inside cells are handled by the page
    if (t.dataset.dt === "filter") view.filterValue = t.value;
    if (t.dataset.dt === "row") t.checked ? view.selected.add(t.value) : view.selected.delete(t.value);
    if (t.dataset.dt === "all") visibleRows().forEach((r) => (t.checked ? view.selected.add(r[rowKey]) : view.selected.delete(r[rowKey])));
    const focusSelector = t.dataset.dt === "row" ? `[data-dt="row"][value="${CSS.escape(t.value)}"]` : `[data-dt="${t.dataset.dt}"]`;
    render();
    container.querySelector(focusSelector)?.focus(); // keep keyboard position after re-render
  });

  render();
  return {
    setRows(next) { view.rows = next; render(); },
    getSelected: () => [...view.selected],
  };
}
