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

/**
 * ✅ Parte un texto en líneas calculando el ancho real en px (simulando el wrap del ticket)
 * - Usa canvas measureText con la MISMA fuente del ticket
 * - Divide por palabras para no cortar feo
 */
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

      // Si una palabra sola es más larga que el ancho, la cortamos por caracteres
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

/**
 * ✅ Construye “tickets” por cantidad de líneas (no por cantidad de items)
 * - Así los ítems largos (3-4 líneas) siguen quedando bien.
 */
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
      while (currentTicket.length < maxItemLinesPerTicket) {
        currentTicket.push(""); // relleno para mismo alto
      }
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

      // Si aún faltan líneas del mismo item, seguimos en otro ticket
      if (idx < itemLines.length) {
        pushTicket();
      }
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

  // ✅ Configurable
  const TICKET_WIDTH_PX = 302; // ~80mm
  const PADDING_X_PX = 12; // coincide con tu CSS padding: 15px 12px
  const CONTENT_WIDTH_PX = TICKET_WIDTH_PX - PADDING_X_PX * 2;

  // ✅ Fuente EXACTA usada en impresión (debe coincidir con CSS)
  const FONT = "bold 18px 'Courier New', monospace";

  // ✅ Ajusta hasta que el corte físico te quede perfecto
  const MAX_ITEM_LINES_PER_TICKET = 10;

  // ✅ Para que todos queden del mismo tamaño físico
  const PAD_TO_FIXED_LINES = true;

  // Separador (una sola línea)
  const singleLine = "--------------------------------------------------";

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
      {/* BOTÓN DE IMPRESIÓN */}
      <div style={{ padding: 8 }}>
        <button
          onClick={() => window.print()}
          style={{
            width: "100%",
            padding: 14,
            fontSize: 18,
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
          {tickets.map((lines, ticketIndex) => {
            const isLast = ticketIndex === tickets.length - 1;

            return (
              <div key={ticketIndex} className="ticket-block">
                {/* ENCABEZADO */}
                <div className="company-name">JAM MADERAS</div>

                {/* ✅ SOLO 1 línea debajo del encabezado */}
                <div className="separator">{singleLine}</div>

                {/* INFO */}
                <div className="order-info">
                  <div>
                    <span className="label">Orden:</span> {order.order_number}
                  </div>
                  <div>
                    <span className="label">Cliente:</span>{" "}
                    {order.client_name || "-"}
                  </div>
                  <div>
                    <span className="label">Creación:</span>{" "}
                    {order.creation_date
                      ? new Date(order.creation_date).toLocaleDateString("es-CO")
                      : "-"}
                  </div>
                  <div>
                    <span className="label">Entrega:</span>{" "}
                    {order.estimated_delivery_date
                      ? new Date(order.estimated_delivery_date).toLocaleDateString(
                          "es-CO"
                        )
                      : "-"}
                  </div>
                </div>

                {/* ✅ SOLO 1 línea después del bloque info */}
                <div className="separator">{singleLine}</div>

                {/* ITEMS (ya vienen “wrappeds” en líneas) */}
                <div className="items-list">
                  {lines.map((ln, i) => (
                    <div key={i} className="item-line">
                      {ln?.trim() ? ln : "\u00A0"}
                    </div>
                  ))}
                </div>

                {/* ✅ FINAL: siempre 1 línea */}
                <div className="separator">{singleLine}</div>

                {/* ✅ SOLO SI VA A EMPEZAR OTRO BLOQUE: aquí sí ponemos la segunda línea (doble) */}
                {!isLast && <div className="separator">{singleLine}</div>}

                {/* Espacio mínimo para corte */}
                <div className="cut-space" />
              </div>
            );
          })}
        </div>
      </div>

      <style>
        {`
        body {
          margin: 0;
          padding: 0;
          background: #f5f5f5;
        }

        .print-container {
          display: flex;
          justify-content: center;
          padding: 20px;
          width: 100%;
        }

        .ticket {
          width: ${TICKET_WIDTH_PX}px;
          background: white;
          padding: 15px ${PADDING_X_PX}px;
          font-family: 'Courier New', monospace;
          font-size: 18px;
          font-weight: bold;
          line-height: 1.4;
          border: 1px solid #ddd;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        .ticket-block {
          margin-bottom: 10px;
          page-break-inside: avoid;
          break-inside: avoid;
        }

        .company-name {
          font-size: 22px;
          font-weight: 900;
          text-align: center;
          text-transform: uppercase;
          margin-bottom: 10px;
          letter-spacing: 1px;
        }

        .separator {
          text-align: center;
          margin: 12px 0;
          font-weight: bold;
        }

        .order-info {
          margin: 15px 0;
        }

        .order-info div {
          margin-bottom: 8px;
        }

        .label {
          font-weight: 900;
        }

        .items-list {
          margin: 15px 0;
        }

        /* ✅ Cada línea tiene altura consistente -> corte consistente */
        .item-line {
          line-height: 1.5;
          margin-bottom: 0px;
          white-space: pre; /* importante: la línea ya viene “wrappeda” */
        }

        .cut-space {
          height: 18px;
        }

        @media print {
          body, html {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          button {
            display: none !important;
          }

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
            padding: 15px ${PADDING_X_PX}px !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            font-family: 'Courier New', monospace !important;
            font-size: 18px !important;
            font-weight: bold !important;
            line-height: 1.4 !important;
          }

          .ticket-block {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
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
