<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Factura #{{ $bill->id }}</title>
    <style>
        * { box-sizing: border-box; }
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 12px;
            color: #1f2937;
            margin: 0;
            padding: 24px;
        }
        h1, h2, h3 { margin: 0; }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #1d4ed8;
            padding-bottom: 12px;
            margin-bottom: 18px;
        }
        .header .title {
            font-size: 22px;
            font-weight: bold;
            color: #1d4ed8;
        }
        .header .meta {
            text-align: right;
            font-size: 11px;
            color: #4b5563;
        }
        .section { margin-bottom: 16px; }
        .section h2 {
            font-size: 13px;
            text-transform: uppercase;
            color: #1d4ed8;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 4px;
            margin-bottom: 6px;
            letter-spacing: 0.5px;
        }
        .grid {
            width: 100%;
            display: table;
        }
        .grid .col {
            display: table-cell;
            width: 50%;
            vertical-align: top;
            padding-right: 8px;
        }
        .label {
            font-size: 10px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.4px;
        }
        .value {
            font-size: 12px;
            color: #111827;
            margin-bottom: 6px;
        }
        table.items {
            width: 100%;
            border-collapse: collapse;
            margin-top: 4px;
        }
        table.items thead th {
            background: #1d4ed8;
            color: #ffffff;
            font-size: 11px;
            text-align: left;
            padding: 6px 8px;
            text-transform: uppercase;
            letter-spacing: 0.4px;
        }
        table.items tbody td {
            padding: 6px 8px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 11px;
            vertical-align: top;
        }
        table.items tbody tr:nth-child(even) td {
            background: #f9fafb;
        }
        .text-right { text-align: right; }
        .totals {
            margin-top: 12px;
            width: 100%;
        }
        .totals td {
            padding: 6px 8px;
            font-size: 12px;
        }
        .totals .total-row td {
            border-top: 2px solid #1d4ed8;
            font-weight: bold;
            font-size: 14px;
            color: #1d4ed8;
        }
        .footer {
            margin-top: 30px;
            font-size: 10px;
            color: #6b7280;
            text-align: center;
            border-top: 1px solid #e5e7eb;
            padding-top: 8px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <div class="title">Factura #{{ $bill->id }}</div>
            <div style="margin-top: 4px; color:#4b5563;">Detalle de facturación</div>
        </div>
        <div class="meta">
            <div><strong>Emitida:</strong> {{ optional($bill->created_at)->format('d/m/Y H:i') }}</div>
            @if($bill->date_from)
                <div><strong>Período:</strong> {{ \Carbon\Carbon::parse($bill->date_from)->format('d/m/Y') }} - {{ $bill->date_to ? \Carbon\Carbon::parse($bill->date_to)->format('d/m/Y') : '—' }}</div>
            @endif
        </div>
    </div>

    <div class="section">
        <h2>Cliente</h2>
        <div class="grid">
            <div class="col">
                <div class="label">Nombre</div>
                <div class="value">{{ $bill->client->name ?? 'N/A' }}</div>
                <div class="label">CUIL</div>
                <div class="value">{{ $bill->client->cuil ?? 'N/A' }}</div>
            </div>
            <div class="col">
                @if(!empty($bill->client?->phone))
                    <div class="label">Teléfono</div>
                    <div class="value">{{ $bill->client->phone }}</div>
                @endif
            </div>
        </div>
    </div>

    <div class="section">
        <h2>Items facturados ({{ $bill->billItems->count() }})</h2>
        <table class="items">
            <thead>
                <tr>
                    <th>Producto</th>
                    <th>Dirección</th>
                    <th class="text-right">Cantidad</th>
                    <th class="text-right">Días</th>
                    <th class="text-right">Costo/día</th>
                    <th class="text-right">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                @forelse($bill->billItems as $item)
                    @php
                        $movement = $item->stockMovement;
                        $product = $movement?->product;
                        $unitPrice = (float) ($item->unit_price ?? 0);
                        if ($unitPrice <= 0) {
                            $unitPrice = (float) ($product->current_cost ?? 0);
                        }
                        $qty = (int) ($movement->qty ?? 0);
                        $days = (int) ($item->days ?? 0);
                        $subtotal = $unitPrice * $qty * $days;
                    @endphp
                    <tr>
                        <td>{{ $product->name ?? 'Sin nombre' }}</td>
                        <td>{{ $movement?->order?->address ?: '—' }}</td>
                        <td class="text-right">{{ $qty }}</td>
                        <td class="text-right">{{ $days }}</td>
                        <td class="text-right">${{ number_format($unitPrice, 2, ',', '.') }}</td>
                        <td class="text-right">${{ number_format($subtotal, 2, ',', '.') }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="6" style="text-align:center; padding:16px; color:#6b7280;">
                            No hay items en esta factura.
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>

        <table class="totals">
            <tr class="total-row">
                <td class="text-right">Total</td>
                <td class="text-right" style="width:160px;">
                    ${{ number_format((float) $bill->amount, 2, ',', '.') }}
                </td>
            </tr>
        </table>
    </div>

    <div class="footer">
        Generado el {{ now()->format('d/m/Y H:i') }}
    </div>
</body>
</html>
