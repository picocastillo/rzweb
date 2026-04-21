<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Informe general</title>
    <style>
        * { box-sizing: border-box; }
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 10px;
            color: #1f2937;
            margin: 0;
            padding: 18px;
        }
        h1, h2 { margin: 0; }
        .header {
            border-bottom: 2px solid #1d4ed8;
            padding-bottom: 8px;
            margin-bottom: 14px;
        }
        .header .title {
            font-size: 18px;
            font-weight: bold;
            color: #1d4ed8;
        }
        .header .subtitle {
            font-size: 11px;
            color: #4b5563;
            margin-top: 2px;
        }
        .filters {
            margin-bottom: 12px;
            font-size: 10px;
            color: #4b5563;
        }
        .filters strong { color: #111827; }
        .filters .chip {
            display: inline-block;
            background: #eef2ff;
            color: #1d4ed8;
            padding: 2px 6px;
            border-radius: 4px;
            margin: 0 4px 4px 0;
        }
        table.items {
            width: 100%;
            border-collapse: collapse;
        }
        table.items thead th {
            background: #1d4ed8;
            color: #ffffff;
            font-size: 10px;
            text-align: left;
            padding: 5px 6px;
            text-transform: uppercase;
            letter-spacing: 0.4px;
        }
        table.items tbody td {
            padding: 4px 6px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 10px;
            vertical-align: top;
        }
        table.items tbody tr:nth-child(even) td {
            background: #f9fafb;
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .footer {
            margin-top: 18px;
            font-size: 9px;
            color: #6b7280;
            text-align: center;
            border-top: 1px solid #e5e7eb;
            padding-top: 6px;
        }
        .badge {
            display: inline-block;
            padding: 1px 6px;
            border-radius: 999px;
            font-size: 9px;
            font-weight: bold;
            background: #e5e7eb;
            color: #374151;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">Informe general</div>
        <div class="subtitle">
            Generado el {{ $generatedAt->format('d/m/Y H:i') }} — {{ $movements->count() }} registros
        </div>
    </div>

    <div class="filters">
        @if($client)
            <span class="chip">Cliente: <strong>{{ $client->name }}</strong></span>
        @endif
        @if(!empty($filters['status']))
            <span class="chip">Estado: <strong>{{ $filters['status'] }}</strong></span>
        @endif
        @if(!empty($filters['start_date']))
            <span class="chip">Desde: <strong>{{ \Carbon\Carbon::parse($filters['start_date'])->format('d/m/Y') }}</strong></span>
        @endif
        @if(!empty($filters['end_date']))
            <span class="chip">Hasta: <strong>{{ \Carbon\Carbon::parse($filters['end_date'])->format('d/m/Y') }}</strong></span>
        @endif
        @if(!empty($filters['address']))
            <span class="chip">Dirección: <strong>{{ $filters['address'] }}</strong></span>
        @endif
    </div>

    <table class="items">
        <thead>
            <tr>
                <th># Orden</th>
                <th>Producto</th>
                <th class="text-right">Precio</th>
                <th class="text-center">Cant</th>
                <th>Estado</th>
                <th>Cliente</th>
                <th>Dirección</th>
                <th>Instalación</th>
                <th>Retiro</th>
                <th class="text-center"># Días</th>
            </tr>
        </thead>
        <tbody>
            @forelse($movements as $movement)
                @php
                    $order = $movement['order'] ?? null;
                    $product = $movement['product'] ?? null;
                    $price = $product['current_cost'] ?? null;
                    $dateFrom = $order['date_from'] ?? null;
                    $dateTo = $order['date_to'] ?? null;
                    $days = ($dateFrom && $dateTo)
                        ? max(1, \Carbon\Carbon::parse($dateFrom)->startOfDay()->diffInDays(\Carbon\Carbon::parse($dateTo)->startOfDay()))
                        : null;
                @endphp
                <tr>
                    <td>{{ $order['id'] ?? '-' }}</td>
                    <td>{{ $product['name'] ?? '-' }}</td>
                    <td class="text-right">{{ $price !== null ? '$ '.number_format((float) $price, 2, ',', '.') : '-' }}</td>
                    <td class="text-center">{{ $movement['qty'] ?? '-' }}</td>
                    <td>
                        @if($order && !empty($order['name_last_state']))
                            <span class="badge">{{ $order['name_last_state'] }}</span>
                        @else
                            -
                        @endif
                    </td>
                    <td>{{ $order['client']['name'] ?? '-' }}</td>
                    <td>{{ $order['address'] ?? '-' }}</td>
                    <td>{{ $dateFrom ? \Carbon\Carbon::parse($dateFrom)->format('d/m/Y') : '-' }}</td>
                    <td>{{ $dateTo ? \Carbon\Carbon::parse($dateTo)->format('d/m/Y') : '-' }}</td>
                    <td class="text-center">{{ $days ?? '-' }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="10" style="text-align:center; padding:16px; color:#6b7280;">
                        No hay movimientos para los filtros seleccionados.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Generado el {{ $generatedAt->format('d/m/Y H:i') }}
    </div>
</body>
</html>
