import { useAuth } from "@/_core/hooks/useAuth";
import { DEV_MODE } from "@/lib/devMode";
import { useDemo } from "@/contexts/DemoContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ShoppingBag, Plus, Edit, Trash2, Package, DollarSign, TrendingUp, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Store() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { isDemoMode } = useDemo();
  const [, setLocation] = useLocation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const { data: products, isLoading, refetch } = trpc.ecommerce.products.getAllActive.useQuery({ limit: 100 }, {
    enabled: !isDemoMode && !DEV_MODE
  });
  const createProduct = trpc.ecommerce.products.create.useMutation({
    onSuccess: () => {
      toast.success("Product created successfully!");
      setIsCreateDialogOpen(false);
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create product");
    },
  });

  const updateProduct = trpc.ecommerce.products.update.useMutation({
    onSuccess: () => {
      toast.success("Product updated successfully!");
      refetch();
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated && !isDemoMode && !DEV_MODE) {
      setLocation("/");
    }
  }, [authLoading, isAuthenticated, isDemoMode, setLocation]);

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    inventoryCount: "",
    productType: "physical" as "physical" | "digital" | "experience",
  });

  const handleCreateProduct = () => {
    const priceInCents = Math.round(parseFloat(newProduct.price) * 100);
    const inventory = parseInt(newProduct.inventoryCount) || 0;

    createProduct.mutate({
      type: newProduct.productType,
      name: newProduct.name,
      description: newProduct.description,
      price: priceInCents,
      inventoryQuantity: inventory,
      slug: newProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      status: "active",
    });
  };

  const toggleProductStatus = (productId: number, currentStatus: "draft" | "active" | "archived") => {
    updateProduct.mutate({
      id: productId,
      status: currentStatus === "active" ? "archived" : "active",
    });
  };

  const stats = [
    {
      title: "Total Products",
      value: products?.length || 0,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Active Listings",
      value: products?.filter((p: any) => p.status === "active").length || 0,
      icon: Eye,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Inventory",
      value: products?.reduce((sum: number, p: any) => sum + (p.inventoryCount || 0), 0) || 0,
      icon: ShoppingBag,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Est. Value",
      value: `$${((products?.reduce((sum: number, p: any) => sum + p.price * (p.inventoryCount || 0), 0) || 0) / 100).toLocaleString()}`,
      icon: DollarSign,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button className="rounded-full" variant="ghost" size="icon" onClick={() => setLocation("/dashboard")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Merchandise Store</h1>
                <p className="text-sm text-muted-foreground">Manage your products and inventory</p>
              </div>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Product</DialogTitle>
                  <DialogDescription>
                    Add a new item to your merchandise store
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      placeholder="e.g., Tour T-Shirt 2025"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      placeholder="Describe your product..."
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (USD)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        placeholder="29.99"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="inventory">Inventory Count</Label>
                      <Input
                        id="inventory"
                        type="number"
                        value={newProduct.inventoryCount}
                        onChange={(e) => setNewProduct({ ...newProduct, inventoryCount: e.target.value })}
                        placeholder="100"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Product Type</Label>
                    <Select
                      value={newProduct.productType}
                      onValueChange={(value: any) => setNewProduct({ ...newProduct, productType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="physical">Physical (Merch, Vinyl, etc.)</SelectItem>
                        <SelectItem value="digital">Digital (Downloads, Samples)</SelectItem>
                        <SelectItem value="experience">Experience (Meet & Greet, Lessons)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button className="rounded-full" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="rounded-full" onClick={handleCreateProduct}
                    disabled={!newProduct.name || !newProduct.price || createProduct.isPending}
                  >
                    {createProduct.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Create Product
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="container py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card className="rounded-xl" key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Products Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Your Products</CardTitle>
            <CardDescription>
              Manage your merchandise, digital products, and experiences
            </CardDescription>
          </CardHeader>
          <CardContent>
            {products && products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product: any) => (
                  <Card className="rounded-xl overflow-hidden" key={product.id}>
                    <div className="aspect-square bg-muted flex items-center justify-center">
                      <ShoppingBag className="h-16 w-16 text-muted-foreground" />
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{product.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {product.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Button className="rounded-full h-8 w-8" variant="ghost"
                            size="icon"
                            onClick={() => toggleProductStatus(product.id, product.isActive)}
                          >
                            {product.isActive ? (
                              <Eye className="h-4 w-4 text-green-600" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div>
                          <p className="text-2xl font-bold">
                            ${(product.price / 100).toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {product.inventoryCount || 0} in stock
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              product.productType === "physical"
                                ? "bg-blue-100 text-blue-700"
                                : product.productType === "digital"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {product.productType}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No products yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start selling by adding your first product
                </p>
                <Button className="rounded-full" onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Product
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Commerce Tips */}
        <Card className="rounded-xl bg-gradient-to-br from-primary/5 to-chart-3/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Maximize Your Merch Sales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div>
                <p className="font-medium">Promote on Social Media</p>
                <p className="text-sm text-muted-foreground">
                  Share product photos and behind-the-scenes content
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div>
                <p className="font-medium">Bundle with Music Releases</p>
                <p className="text-sm text-muted-foreground">
                  Offer exclusive merch with new album drops
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div>
                <p className="font-medium">Limited Edition Drops</p>
                <p className="text-sm text-muted-foreground">
                  Create scarcity with numbered or time-limited items
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
