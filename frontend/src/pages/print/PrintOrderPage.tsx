import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

type OrderItem = {
  description: string;
  quantity: number;
  width: number;
  calibre: number;
  length: number;
};

type Order = {
  order_number: string;
  client_name: string | null;
  creation_date: string | null;
  estimated_delivery_date: string | null;
  items: OrderItem[];
};

export default function PrintOrderPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((res) => res.json())
      .then(setOrder);
  }, [id]);

  if (!order) return null;

  return (
    <div style={styles.ticket}>
      {/* ESPACIO SUPERIOR */}
      <div style={{ height: "10mm" }} />

      {/* ENCABEZADO */}
      <div style={styles.center}>
        <strong>JAM MADERAS</strong>
      </div>

      <div style={styles.separator} />

      {/* DATOS DE LA ORDEN */}
      <div>
        <strong>Orden:</strong> {order.order_number}
        <br />
        <strong>Cliente:</strong> {order.client_name || "-"}
        <br />
        <strong>Creación:</strong>{" "}
        {order.creation_date || "-"}
        <br />
        <strong>Entrega:</strong>{" "}
        {order.estimated_delivery_date || "-"}
      </div>

      <div style={styles.separator} />

      {/* ITEMS */}
      {order.items.map((item, index) => (
        <div key={index} style={{ marginBottom: "6px" }}>
          <strong>
            {item.quantity} x {item.description}
          </strong>
          <br />
          Ancho: {item.width} | Largo: {item.length} | Calibre: {item.calibre}
        </div>
      ))}

      <div style={styles.separator} />

      {/* FOOTER */}
      <div style={styles.center}>
        Gracias por su compra
        <br />
        <br />
        <br />
      </div>
    </div>
  );
}

const styles = {
  ticket: {
    width: "80mm",
    fontFamily: "monospace",
    fontSize: "12px",
    padding: "5px",
    lineHeight: "1.4",
  },
  center: {
    textAlign: "center" as const,
  },
  separator: {
    margin: "6px 0",
    borderTop: "1px dashed #000",
  },
};
