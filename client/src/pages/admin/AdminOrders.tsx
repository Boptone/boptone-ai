import AdminDashboard from "@/components/AdminDashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Search } from "lucide-react";
import { useState } from "react";

/**
 * Admin Orders Management Page
 * 
 * Features:
 * - Order listing with table view
 * - Filters: status, date range, customer, artist
 * - Order details modal
 * - Order actions: fulfill, refund, cancel
 * - Search functionality
 * - Audit logging integration
 */
export default function AdminOrders() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // TODO: Replace with real tRPC query
  // const { data: orders, isLoading } = trpc.admin.orders.getAll.useQuery({
  //   status: statusFilter === "all" ? undefined : statusFilter,
  //   search: searchQuery,
  // });

  // Mock data for now
  const orders = [
    {
      id: 1,
      orderNumber: "ORD-001",
      customer: "John Doe",
      artist: "Artist Name",
      total: 29.99,
      status: "completed",
      createdAt: new Date("2026-02-15"),
    },
    {
      id: 2,
      orderNumber: "ORD-002",
      customer: "Jane Smith",
      artist: "Another Artist",
      total: 49.99,
      status: "pending",
      createdAt: new Date("2026-02-18"),
    },
    {
      id: 3,
      orderNumber: "ORD-003",
      customer: "Bob Johnson",
      artist: "Third Artist",
      total: 19.99,
      status: "shipped",
      createdAt: new Date("2026-02-19"),
    },
  ];

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <AdminDashboard>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders</h1>
        <p className="text-gray-600 mb-8">
          Manage all orders, process refunds, and track fulfillment.
        </p>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              {/* Date Range - TODO: Implement date picker */}
              <Button variant="outline">
                Date Range
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Orders ({orders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Order #
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Customer
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Artist
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Total
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {order.customer}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {order.artist}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        ${order.total.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {order.createdAt.toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {orders.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No orders found.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminDashboard>
  );
}
