export const downloadCsv = (filename, rows) => {
	const csv = rows
		.map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))
		.join("\n");
	const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
};

export const downloadPdf = (title, headers, rows) => {
	const win = window.open("", "_blank");
	if (!win) return;
	const head = headers.map((h) => `<th>${String(h)}</th>`).join("");
	const body = rows
		.map(
			(r) =>
				`<tr>${r.map((c) => `<td>${String(c ?? "")}</td>`).join("")}</tr>`
		)
		.join("");
	win.document.write(`<!doctype html><html><head><meta charset="utf-8"/><title>${title}</title>
	<style>
		body{font-family:Arial,sans-serif;padding:24px;color:#111}
		h1{font-size:20px;margin:0 0 12px}
		p{font-size:12px;color:#555;margin:0 0 16px}
		table{width:100%;border-collapse:collapse;font-size:12px}
		th,td{border:1px solid #ddd;padding:8px;text-align:left;vertical-align:top}
		th{background:#f5f5f5}
		@media print{body{padding:0}}
	</style></head><body>
	<h1>${title}</h1>
	<p>Generated ${new Date().toLocaleString()}</p>
	<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
	<script>window.onload=()=>{window.print();}</script>
	</body></html>`);
	win.document.close();
};
