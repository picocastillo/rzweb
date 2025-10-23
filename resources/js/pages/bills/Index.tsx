import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { FileText, Search, Filter, Download, Eye, Trash2, Plus } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Client {
  id: number;
  name: string;
  cuil: string;
}

interface Bill {
  id: number;
  client_id: number;
  client: Client;
  date_from: string;
  amount: number;
  name: string;
  cuil: string;
  phone: string;
  created_at: string;
}

interface Props {
  bills: Bill[];
}

export default function IndexBills({ bills }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Facturas', href: '/bills' },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount);
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return '';
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) return ''; // evita mostrar 1970
    return parsed.toLocaleDateString('es-AR');
  };

  const filteredBills = bills.filter((bill) => {
    const matchesSearch =
      bill.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.client?.cuil?.includes(searchTerm);

    const billDate = new Date(bill.date_from);
    const matchesMonth =
      !filterMonth || (billDate.getMonth() + 1).toString() === filterMonth;
    const matchesYear =
      !filterYear || billDate.getFullYear().toString() === filterYear;

    return matchesSearch && matchesMonth && matchesYear;
  });

  const totalAmount = filteredBills.reduce((sum, bill) => sum + bill.amount, 0);

  // const uniqueYears = [...new Set(bills.map(bill => 
  //   new Date(bill.date_from).getFullYear()
  // ))].sort((a, b) => b - a);

  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta factura?')) {
      router.delete(`/bills/${id}`);
    }
  };

  const handleView = (id: number) => {
    router.visit(`/bills/${id}`);
  };

  const handleDownload = (id: number) => {
    window.open(`/bills/${id}/download`, '_blank');
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Facturas" />
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              Facturas
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Gestiona y visualiza todas las facturas generadas
            </p>
          </div>
          <button
            onClick={() => router.visit('/bills/create')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Nueva Factura
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white mb-1">Total Facturas</p>
              <p className="text-2xl font-bold text-white">{filteredBills.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white mb-1">Monto Total</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totalAmount)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white mb-1">Promedio por Factura</p>
              <p className="text-2xl font-bold text-white">
                {filteredBills.length > 0 
                  ? formatCurrency(totalAmount / filteredBills.length)
                  : formatCurrency(0)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow mb-6 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-white">Filtros</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cliente, nombre o CUIL..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Año
            </label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">Todos los años</option>
              {uniqueYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div> */}
        </div>

        {(searchTerm || filterMonth || filterYear) && (
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterMonth('');
              setFilterYear('');
            }}
            className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Bills Table */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        {filteredBills.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No se encontraron facturas</p>
            <p className="text-gray-400 text-sm mt-2">
              {searchTerm || filterMonth || filterYear 
                ? 'Intenta ajustar los filtros'
                : 'Comienza creando tu primera factura'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Factura
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CUIL/CUIT
                  </th>
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Período
                  </th> */}
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Creada
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {bill.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {bill.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{bill.client.name}</div>
                      {bill.phone && (
                        <div className="text-sm text-gray-500">{bill.phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {bill.client.cuil}
                    </td>
                    {/* <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-medium">
                        {getMonthName(bill.date_from)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(bill.date_from)}
                      </div>
                    </td> */}
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-bold text-green-600">
                        {formatCurrency(bill.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(bill.date_from || bill.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleView(bill.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDownload(bill.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Descargar PDF"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(bill.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Footer */}
      {filteredBills.length > 0 && (
        <div className="mt-4 bg-gray-50 rounded-lg p-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Mostrando <span className="font-semibold">{filteredBills.length}</span> de{' '}
            <span className="font-semibold">{bills.length}</span> facturas
          </div>
          <div className="text-sm font-semibold text-gray-900">
            Total filtrado: {formatCurrency(totalAmount)}
          </div>
        </div>
      )}
    </div>
    </AppLayout>
  );
}