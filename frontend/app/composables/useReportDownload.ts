// composables/useReportDownload.ts
// Install deps first:  npm install jspdf jspdf-autotable xlsx

import dayjs from 'dayjs'

// ── Types ──────────────────────────────────────────────────────────────────
interface Column {
  header: string
  key: string
  width?: number        // Excel column width (chars)
// ✅ accepts any string, keeps autocomplete hints
align?: 'left' | 'center' | 'right' | (string & {})
}

interface DownloadOptions {
  filename: string      // without extension
  title: string         // shown in PDF header
  subtitle?: string     // e.g. "February 2026 · 8 employees"
  columns: Column[]
  rows: Record<string, any>[]
  totalsRow?: Record<string, any>  // optional footer totals
}

// ── Composable ─────────────────────────────────────────────────────────────
export function useReportDownload() {

  const downloading = ref(false)

  // ── PDF ──────────────────────────────────────────────────────────────────
  const downloadPDF = async (opts: DownloadOptions) => {
    downloading.value = true
    try {
      const { default: jsPDF } = await import('jspdf')
      const { default: autoTable } = await import('jspdf-autotable')

      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

      // ── Header bar ──
      doc.setFillColor(21, 101, 192)   // #1565C0
      doc.rect(0, 0, 297, 22, 'F')

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text(opts.title, 10, 10)

      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      if (opts.subtitle) doc.text(opts.subtitle, 10, 16)
      doc.text(`Generated: ${dayjs().format('DD MMM YYYY, hh:mm A')}`, 287, 16, { align: 'right' })

      // ── Table ──
      const head = [opts.columns.map(c => c.header)]
      const body = opts.rows.map(row =>
        opts.columns.map(c => row[c.key] ?? '—')
      )

      // Optional totals row
      if (opts.totalsRow) {
        body.push(opts.columns.map(c => opts.totalsRow![c.key] ?? ''))
      }

      autoTable(doc, {
        head,
        body,
        startY: 26,
        styles: {
          fontSize: 9,
          cellPadding: 3,
          font: 'helvetica',
          lineColor: [224, 224, 224],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [250, 250, 250],
          textColor: [117, 117, 117],
          fontStyle: 'bold',
          fontSize: 8,
        },
        alternateRowStyles: {
          fillColor: [248, 249, 250],
        },
        // Bold + tinted last row if totals
        didParseCell: (data) => {
          if (opts.totalsRow && data.row.index === body.length - 1) {
            data.cell.styles.fillColor = [232, 245, 233]
            data.cell.styles.fontStyle = 'bold'
            data.cell.styles.textColor = [27, 94, 32]
          }
        },
        columnStyles: opts.columns.reduce((acc, col, i) => {
          acc[i] = { halign: col.align ?? 'left' }
          return acc
        }, {} as any),
        margin: { left: 10, right: 10 },
      })

      doc.save(`${opts.filename}.pdf`)
    } finally {
      downloading.value = false
    }
  }

  // ── Excel ─────────────────────────────────────────────────────────────────
  const downloadExcel = async (opts: DownloadOptions) => {
    downloading.value = true
    try {
      const XLSX = await import('xlsx')

      // Header info rows
      const infoRows = [
        [opts.title],
        [opts.subtitle ?? ''],
        [`Generated: ${dayjs().format('DD MMM YYYY, hh:mm A')}`],
        [], // blank row
        opts.columns.map(c => c.header), // column headers
      ]

      // Data rows
      const dataRows = opts.rows.map(row =>
        opts.columns.map(c => row[c.key] ?? '')
      )

      // Optional totals
      if (opts.totalsRow) {
        dataRows.push(opts.columns.map(c => opts.totalsRow![c.key] ?? ''))
      }

      const allRows = [...infoRows, ...dataRows]
      const ws = XLSX.utils.aoa_to_sheet(allRows)

      // Column widths
      ws['!cols'] = opts.columns.map(c => ({ wch: c.width ?? 18 }))

      // Merge title cell across all columns
      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: opts.columns.length - 1 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: opts.columns.length - 1 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: opts.columns.length - 1 } },
      ]

      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Report')
      XLSX.writeFile(wb, `${opts.filename}.xlsx`)
    } finally {
      downloading.value = false
    }
  }

  // ── Both ──────────────────────────────────────────────────────────────────
  const downloadBoth = async (opts: DownloadOptions) => {
    await downloadPDF(opts)
    await downloadExcel(opts)
  }

  return { downloading, downloadPDF, downloadExcel, downloadBoth }
}