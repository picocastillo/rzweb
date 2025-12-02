<?php

namespace App\Models;

use Exception;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Bill extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'client_id',
        'date_from',
        'amount',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date_from' => 'datetime:Y-m-d H:i:s',
            'amount' => 'float',
            'created_at' => 'datetime:Y-m-d H:i:s',
        ];
    }

    //// Relationships ////
    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function billItems()
    {
        return $this->hasMany(BillItem::class);
    }

    // ////////////////
    // /Functions
    // ////////////////
    public static function createWithInitialState(array $attributes = [])
    {
        try {
            return DB::transaction(function () use ($attributes) {

                // Validamos
                self::ensureOrdersSelected($attributes);

                // Obtenemos fechas
                $clientId   = $attributes['client_id'];
                $lastBill   = self::getLastBillForClient($clientId);
                $startDate  = self::calculateStartDate($lastBill, $attributes);

                // movimientos
                $orderIds   = $attributes['orders'];
                $movements  = self::getPendingMovements($orderIds, $lastBill, $startDate);

                if ($movements->isEmpty()) {
                    throw new Exception('No hay movimientos pendientes para facturar para este cliente');
                }

                $bill = Bill::create([
                    'client_id' => $clientId,
                    'date_from' => $startDate,
                    'amount'    => 0,
                ]);

                $totalAmount = self::processBillMovements($bill, $movements);

                // total
                $bill->update(['amount' => $totalAmount]);

                return $bill;
            });

        } catch (Exception $e) {
            Log::error('Error al crear factura: '.$e->getMessage());
            throw $e;
        }
    }
    // VALIDACIONES
    private static function ensureOrdersSelected(array $attributes)
    {
        if (empty($attributes['orders'] ?? [])) {
            throw new Exception('Debe seleccionar al menos una orden para facturar');
        }
    }
    // OBTENEMOS FACTURA ANTERIOR
    private static function getLastBillForClient(int $clientId)
    {
        return Bill::where('client_id', $clientId)
            ->latest('date_from')
            ->first();
    }
    // CALCULAMOS FECHA DE INICIO
    private static function calculateStartDate($lastBill, array $attributes)
    {
        $today = Carbon::today();

        if ($lastBill) {
            return Carbon::parse($lastBill->created_at);
        }

        return Carbon::parse($attributes['date'] ?? $today);
    }
    // MOVIMIENTOS PENDIENTES
    private static function getPendingMovements(array $orderIds, $lastBill, Carbon $startDate)
    {
        $today = Carbon::today();

        $query = StockMovement::where('type', 0)
            ->where('is_billed', false)
            ->whereHas('itemOrders', function ($q) use ($orderIds) {
                $q->whereIn('order_id', $orderIds);
            });

        if ($lastBill) {
            return $query
                ->whereBetween('created_at', [$startDate, $today->endOfDay()])
                ->get();
        }

        return $query
            ->where('created_at', '<=', $today->endOfDay())
            ->get();
    }
    // PROCESAMOS MOVIMIENTOS → CREAR ITEMS + ACUMULAR TOTAL
    private static function processBillMovements(Bill $bill, $movements)
    {
        $total = 0;

        foreach ($movements as $movement) {

            $order = $movement->itemOrders->first()->order;

            $orderStart   = Carbon::parse($order->date_from)->startOfDay();
            $orderEnd   = Carbon::parse($order->date_to)->startOfDay();
            $movementDate = Carbon::parse($movement->created_at)->startOfDay();

            // 1. se factura despues del alquiler contratado
            if ($movementDate->greaterThan($orderEnd)) {
                $days = $orderStart->diffInDays($orderEnd);
            }
            // 2. facturacion normal
            else {
                $days = $orderStart->diffInDays($movementDate);
            }

            BillItem::create([
                'bill_id'            => $bill->id,
                'days'               => $days,
                'stock_movement_id'  => $movement->id,
            ]);

            $productCost = $movement->product->current_cost ?? 0;
            $subtotal    = $movement->qty * $days * $productCost;
            $total      += $subtotal;

            $movement->is_billed = true;
            $movement->save();
        }

        return $total;
    }
}
