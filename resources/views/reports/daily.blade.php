<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Informe diario - {{ $date }}</title>
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
        .filters .chip {
            display: inline-block;
            background: #eef2ff;
            color: #1d4ed8;
            padding: 2px 6px;
            border-radius: 4px;
            margin: 0 4px 4px 0;
        }
        .section { margin-bottom: 18px; }
        .section h2 {
            font-size: 12px;
            text-transform: uppercase;
            color: #1d4ed8;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 4px;
            margin-bottom: 6px;
            letter-spacing: 0.5px;
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
        .text-center { text-align: center; }
        .badge {
            display: inline-block;
            padding: 1px 6px;
            border-radius: 999px;
            font-size: 9px;
            font-weight: bold;
            background: #e5e7eb;
            color: #374151;
        }
        .footer {
            margin-top: 18px;
            font-size: 9px;
            color: #6b7280;
            text-align: center;
            border-top: 1px solid #e5e7eb;
            padding-top: 6px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">Informe diario</div>
        <div class="subtitle">
            Fecha: <strong>{{ \Carbon\Carbon::parse($date)->format('d/m/Y') }}</strong> — Generado el {{ now()->format('d/m/Y H:i') }}
        </div>
    </div>

    <div class="filters">
        @if($client)
            <span class="chip">Cliente: <strong>{{ $client->name }}</strong></span>
        @endif
    </div>

    @php
        $renderTable = function ($rows, $emptyMessage) {
            return [$rows, $emptyMessage];
        };
    @endphp

    <div class="section">
        <h2>Instalaciones ({{ count($installations) }})</h2>
        <table class="items">
            <thead>
                <tr>
                    <th>Hora</th>
                    <th># Orden</th>
                    <th>Producto</th>
                    <th class="text-center">Cant</th>
                    <th>Cliente</th>
                    <th>Dirección</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody>
                @forelse($installations as $row)
                    <tr>
                        <td>{{ $row['created_at'] ? \Carbon\Carbon::parse($row['created_at'])->format('H:i') : '-' }}</td>
                        <td>{{ $row['order']['id'] ?? '-' }}</td>
                        <td>{{ $row['product']['name'] ?? '-' }}</td>
                        <td class="text-center">{{ $row['qty'] ?? '-' }}</td>
                        <td>{{ $row['order']['client']['name'] ?? '-' }}</td>
                        <td>{{ $row['order']['address'] ?? '-' }}</td>
                        <td>
                            @if(!empty($row['order']['name_last_state']))
                                <span class="badge">{{ $row['order']['name_last_state'] }}</span>
                            @else
                                -
                            @endif
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="7" style="text-align:center; padding:12px; color:#6b7280;">
                            No hay instalaciones registradas en la fecha.
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>Retiros ({{ count($removals) }})</h2>
        <table class="items">
            <thead>
                <tr>
                    <th>Hora</th>
                    <th># Orden</th>
                    <th>Producto</th>
                    <th class="text-center">Cant</th>
                    <th>Cliente</th>
                    <th>Dirección</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody>
                @forelse($removals as $row)
                    <tr>
                        <td>{{ $row['created_at'] ? \Carbon\Carbon::parse($row['created_at'])->format('H:i') : '-' }}</td>
                        <td>{{ $row['order']['id'] ?? '-' }}</td>
                        <td>{{ $row['product']['name'] ?? '-' }}</td>
                        <td class="text-center">{{ $row['qty'] ?? '-' }}</td>
                        <td>{{ $row['order']['client']['name'] ?? '-' }}</td>
                        <td>{{ $row['order']['address'] ?? '-' }}</td>
                        <td>
                            @if(!empty($row['order']['name_last_state']))
                                <span class="badge">{{ $row['order']['name_last_state'] }}</span>
                            @else
                                -
                            @endif
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="7" style="text-align:center; padding:12px; color:#6b7280;">
                            No hay retiros registrados en la fecha.
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <div class="footer">
        Generado el {{ now()->format('d/m/Y H:i') }}
    </div>
</body>
</html>
