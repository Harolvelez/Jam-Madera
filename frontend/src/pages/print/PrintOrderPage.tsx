import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "../../services/api";

type OrderItem = {
  description: string;
};

type Order = {
  order_number: string;
  client_name: string | null;
  creation_date: string | null;
  estimated_delivery_date: string | null;
  items: OrderItem[];
};

function wrapToLines(text: string, maxWidthPx: number, font: string) {
  const t = String(text ?? "").trim();
  if (!t) return [""];

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return [t];

  ctx.font = font;

  const words = t.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const w of words) {
    const test = current ? `${current} ${w}` : w;
    const width = ctx.measureText(test).width;

    if (width <= maxWidthPx) {
      current = test;
    } else {
      if (current) lines.push(current);

      if (ctx.measureText(w).width > maxWidthPx) {
        let chunk = "";
        for (const ch of w) {
          const test2 = chunk + ch;
          if (ctx.measureText(test2).width <= maxWidthPx) {
            chunk = test2;
          } else {
            if (chunk) lines.push(chunk);
            chunk = ch;
          }
        }
        current = chunk;
      } else {
        current = w;
      }
    }
  }

  if (current) lines.push(current);
  return lines;
}

function paginateByLines(
  items: OrderItem[],
  maxWidthPx: number,
  font: string,
  maxItemLinesPerTicket: number,
  padToFixed: boolean
) {
  const allLinesPerItem: string[][] = (items ?? [])
    .map((it) => wrapToLines(it.description, maxWidthPx, font))
    .filter((arr) => arr.some((x) => String(x).trim() !== ""));

  const tickets: string[][] = [];
  let currentTicket: string[] = [];

  const pushTicket = () => {
    if (padToFixed) {
      while (currentTicket.length < maxItemLinesPerTicket) currentTicket.push("");
    }
    tickets.push(currentTicket);
    currentTicket = [];
  };

  for (const itemLines of allLinesPerItem) {
    let idx = 0;

    while (idx < itemLines.length) {
      const remaining = maxItemLinesPerTicket - currentTicket.length;

      if (remaining <= 0) {
        pushTicket();
        continue;
      }

      const take = Math.min(remaining, itemLines.length - idx);
      currentTicket.push(...itemLines.slice(idx, idx + take));
      idx += take;

      if (idx < itemLines.length) pushTicket();
    }
  }

  if (currentTicket.length > 0) pushTicket();

  if (tickets.length === 0) {
    tickets.push(padToFixed ? Array(maxItemLinesPerTicket).fill("") : [""]);
  }

  return tickets;
}

export default function PrintOrderPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    apiFetch<Order>(`/orders/${id}`).then(setOrder).catch(console.error);
  }, [id]);

  if (!order) return null;

  // ===== Config =====
  const TICKET_WIDTH_PX = 302; // ~80mm
  const PADDING_X_PX = 10;
  const PADDING_Y_PX = 6;
  const CONTENT_WIDTH_PX = TICKET_WIDTH_PX - PADDING_X_PX * 2;

  // IMPORTANTE: debe coincidir con CSS para wrap por px
  const FONT =
    "600 15px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";

  const MAX_ITEM_LINES_PER_TICKET = 15;
  const PAD_TO_FIXED_LINES = true;

  const tickets = useMemo(() => {
    return paginateByLines(
      order.items ?? [],
      CONTENT_WIDTH_PX,
      FONT,
      MAX_ITEM_LINES_PER_TICKET,
      PAD_TO_FIXED_LINES
    );
  }, [order.items]);

  return (
    <>
      <div style={{ padding: 8 }}>
        <button
          onClick={() => window.print()}
          style={{
            width: "100%",
            padding: 12,
            fontSize: 16,
            backgroundColor: "#2f9e44",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Imprimir
        </button>
      </div>

      <div className="print-container">
        <div className="ticket">
          {tickets.map((lines, ticketIndex) => (
            <div key={ticketIndex} className="ticket-block">
              <div className="company-name">JAM MADERAS</div>

              <div className="rule" />

              <div className="order-info">
                <div>
                  <span className="label">Orden:</span> {order.order_number}
                </div>
                <div>
                  <span className="label">Cliente:</span> {order.client_name || "-"}
                </div>
                <div>
                  <span className="label">Creación:</span>{" "}
                  {order.creation_date
                    ? (() => {
                        const [y, m, d] = order.creation_date.split("-").map(Number);
                        return new Date(y, m - 1, d).toLocaleDateString("es-CO");
                      })()
                    : "-"}
                </div>
                <div>
                  <span className="label">Entrega:</span>{" "}
                  {order.estimated_delivery_date
                    ? (() => {
                        const [y, m, d] = order.estimated_delivery_date.split("-").map(Number);
                        return new Date(y, m - 1, d).toLocaleDateString("es-CO");
                      })()
                    : "-"}
                </div>
              </div>

              <div className="rule" />

              <div className="items-list">
                {lines.map((ln, i) => (
                  <div key={i} className="item-line">
                    {ln?.trim() ? ln : "\u00A0"}
                  </div>
                ))}
              </div>

              <div className="rule" />
              <div className="cut-space" />
            </div>
          ))}
        </div>
      </div>

      <style>
        {`
        body { margin: 0; padding: 0; background: #f5f5f5; }

        .print-container {
          display: flex;
          justify-content: center;
          padding: 16px;
          width: 100%;
        }

        .ticket {
          width: ${TICKET_WIDTH_PX}px;
          background: #fff;
          padding: ${PADDING_Y_PX}px ${PADDING_X_PX}px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
          font-size: 15px;
          font-weight: 600;
          line-height: 1.22;
          border: 1px solid #e9ecef;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .ticket-block {
          margin: 0 0 8px 0;
          break-inside: avoid;
          page-break-inside: avoid;
        }

        .company-name {
          font-size: 17px;
          font-weight: 750;
          text-align: center;
          text-transform: uppercase;
          margin: 0 0 6px 0;
          letter-spacing: 0.5px;
        }

        /* ✅ Separador REAL (NO texto) -> coincide en impresión */
        .rule {
          height: 1px;
          background: #000;
          opacity: 0.7;
          margin: 6px 0;
        }

        .order-info { margin: 6px 0; }
        .order-info div { margin-bottom: 3px; }

        .label { font-weight: 750; }

        .items-list { margin: 6px 0; }

        .item-line {
          line-height: 1.2;
          margin: 0;
          white-space: pre;
        }

        .cut-space { height: 10px; }

        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          button { display: none !important; }

          .print-container {
            display: block !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }

          .ticket {
            width: ${TICKET_WIDTH_PX}px !important;
            min-width: ${TICKET_WIDTH_PX}px !important;
            max-width: ${TICKET_WIDTH_PX}px !important;

            padding: 4px ${PADDING_X_PX}px !important; /* top mínimo */
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            position: static !important;
          }

          /* NO forzamos page-break-after: evita feeds raros en térmicas */
          .ticket-block {
            margin: 0 0 8px 0 !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          @page {
            size: 80mm auto;
            margin: 0mm !important;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
        `}
      </style>
    </>
  );
}
