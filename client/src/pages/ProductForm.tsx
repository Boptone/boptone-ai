import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useLocation, useParams } from "wouter";
import { Upload, X, Package, ArrowLeft } from "lucide-react";
import { storagePut } from "@/lib/storage";

/**
 * BopShop Product Form (Add/Edit)
 * Artists can create or edit products with multi-currency pricing
 */
export default function ProductForm() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams();
  const productId = params.id ? parseInt(params.id) : null;
  const isEditing = productId !== null;

  // Form state
  const [formData, setFormData] = useState({
    type: "physical" as "physical" | "digital" | "experience",
    name: "",
    description: "",
    price: "",
    compareAtPrice: "",
    sku: "",
    inventoryQuantity: "0",
    trackInventory: true,
    allowBackorder: false,
    slug: "",
    tags: "",
    category: "",
    requiresShipping: false,
    weight: "",
    status: "draft" as "draft" | "active" | "archived",
    featured: false,
  });

  const [images, setImages] = useState<Array<{ url: string; alt?: string; position: number }>>([]);
  const [primaryImageUrl, setPrimaryImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  // Fetch product data if editing
  const { data: product, isLoading } = trpc.ecommerce.products.getById.useQuery(
    { id: productId! },
    { enabled: isEditing && productId !== null }
  );

  // Populate form when editing
  useEffect(() => {
    if (product) {
      setFormData({
        type: product.type,
        name: product.name,
        description: product.description || "",
        price: (product.price / 100).toFixed(2),
        compareAtPrice: product.compareAtPrice ? (product.compareAtPrice / 100).toFixed(2) : "",
        sku: product.sku || "",
        inventoryQuantity: product.inventoryQuantity?.toString() || "0",
        trackInventory: product.trackInventory ?? true,
        allowBackorder: product.allowBackorder ?? false,
        slug: product.slug,
        tags: product.tags?.join(", ") || "",
        category: product.category || "",
        requiresShipping: product.requiresShipping ?? false,
        weight: product.weight || "",
        status: product.status,
        featured: product.featured ?? false,
      });
      if (product.images) {
        setImages(product.images);
      }
      if (product.primaryImageUrl) {
        setPrimaryImageUrl(product.primaryImageUrl);
      }
    }
  }, [product]);

  // Create mutation
  const createMutation = trpc.ecommerce.products.create.useMutation({
    onSuccess: () => {
      toast.success("Product created successfully");
      setLocation("/products");
    },
    onError: (error) => {
      toast.error(`Failed to create product: ${error.message}`);
    },
  });

  // Update mutation
  const updateMutation = trpc.ecommerce.products.update.useMutation({
    onSuccess: () => {
      toast.success("Product updated successfully");
      setLocation("/products");
    },
    onError: (error) => {
      toast.error(`Failed to update product: ${error.message}`);
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Enforce 10 image limit
    const remainingSlots = 10 - images.length;
    if (remainingSlots <= 0) {
      toast.error("Maximum 10 images allowed per product");
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      toast.info(`Only uploading ${remainingSlots} images (10 image limit)`);
    }

    setUploading(true);
    try {
      for (const file of filesToUpload) {
        // Upload to S3
        const fileKey = `products/${Date.now()}-${file.name}`;
        const { url } = await storagePut(fileKey, file, file.type);

        // Add to images array
        const newImage = {
          url,
          alt: formData.name || file.name,
          position: images.length,
        };
        setImages((prev) => [...prev, newImage]);

        // Set as primary if first image
        if (images.length === 0) {
          setPrimaryImageUrl(url);
        }
      }
      toast.success("Images uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload images");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleAltTextChange = (index: number, altText: string) => {
    setImages((prev) =>
      prev.map((img, i) => (i === index ? { ...img, alt: altText } : img))
    );
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const newImages = prev.filter((_, i) => i !== index);
      // Update positions
      return newImages.map((img, i) => ({ ...img, position: i }));
    });
    // Update primary image if removed
    if (images[index].url === primaryImageUrl && images.length > 1) {
      setPrimaryImageUrl(images[0].url !== images[index].url ? images[0].url : images[1]?.url || "");
    } else if (images.length === 1) {
      setPrimaryImageUrl("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error("Valid price is required");
      return;
    }
    if (!formData.slug.trim()) {
      toast.error("Product slug is required");
      return;
    }

    // Prepare data
    const productData = {
      type: formData.type,
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      price: Math.round(parseFloat(formData.price) * 100), // Convert to cents
      compareAtPrice: formData.compareAtPrice
        ? Math.round(parseFloat(formData.compareAtPrice) * 100)
        : undefined,
      sku: formData.sku.trim() || undefined,
      inventoryQuantity: parseInt(formData.inventoryQuantity) || 0,
      trackInventory: formData.trackInventory,
      allowBackorder: formData.allowBackorder,
      images: images.length > 0 ? images : undefined,
      primaryImageUrl: primaryImageUrl || undefined,
      slug: formData.slug.trim(),
      tags: formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0),
      category: formData.category.trim() || undefined,
      requiresShipping: formData.requiresShipping,
      weight: formData.weight.trim() || undefined,
      status: formData.status,
      featured: formData.featured,
    };

    if (isEditing && productId) {
      updateMutation.mutate({ id: productId, ...productData });
    } else {
      createMutation.mutate(productData);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Auto-generate slug from name
    if (field === "name" && !isEditing) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-pulse" />
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => setLocation("/products")}
            className="mb-4 rounded-xl border border-gray-200 hover:border-gray-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
          <h1 className="text-5xl font-bold mb-4">
            {isEditing ? "Edit Product" : "Add New Product"}
          </h1>
          <p className="text-xl text-gray-600">
            {isEditing
              ? "Update your product details and pricing"
              : "Create a new product for your BopShop"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Product Type */}
          <div>
            <Label className="text-lg font-bold mb-3 block">Product Type</Label>
            <div className="grid grid-cols-3 gap-4">
              {["physical", "digital", "experience"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleInputChange("type", type)}
                  className={`p-4 rounded-xl border transition-colors ${
                    formData.type === type
                      ? "border-black bg-black text-white"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-lg font-bold mb-2 block">
                Product Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g., Limited Edition Vinyl"
                className="rounded-xl border border-gray-200 focus:border-gray-400"
                required
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-lg font-bold mb-2 block">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe your product..."
                rows={4}
                className="rounded-xl border border-gray-200 focus:border-gray-400"
              />
            </div>

            <div>
              <Label htmlFor="slug" className="text-lg font-bold mb-2 block">
                URL Slug *
              </Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => handleInputChange("slug", e.target.value)}
                placeholder="product-url-slug"
                className="rounded-xl border border-gray-200 focus:border-gray-400"
                required
              />
              <p className="text-sm text-gray-600 mt-1">
                Will be used in the product URL: /shop/{formData.slug}
              </p>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Pricing</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price" className="text-lg font-bold mb-2 block">
                  Price (USD) *
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  placeholder="0.00"
                  className="rounded-xl border border-gray-200 focus:border-gray-400"
                  required
                />
              </div>
              <div>
                <Label htmlFor="compareAtPrice" className="text-lg font-bold mb-2 block">
                  Compare At Price (USD)
                </Label>
                <Input
                  id="compareAtPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.compareAtPrice}
                  onChange={(e) => handleInputChange("compareAtPrice", e.target.value)}
                  placeholder="0.00"
                  className="rounded-xl border border-gray-200 focus:border-gray-400"
                />
                <p className="text-sm text-gray-600 mt-1">Original price (for showing discounts)</p>
              </div>
            </div>
          </div>

          {/* Images */}
          <div>
            <Label className="text-lg font-bold mb-3 block">Product Images</Label>
            <div className="grid grid-cols-4 gap-4 mb-4">
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image.url}
                    alt={image.alt || "Product"}
                    className="w-full h-32 object-contain rounded-xl border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {primaryImageUrl === image.url && (
                    <span className="absolute bottom-2 left-2 bg-black text-white text-xs px-2 py-1 rounded">
                      Primary
                    </span>
                  )}
                </div>
              ))}
            </div>
            <label className="cursor-pointer">
              <div className="border border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition-colors">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-600">
                  {uploading ? "Uploading..." : "Click to upload images"}
                </p>
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>

          {/* Inventory */}
          {formData.type === "physical" && (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">Inventory</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sku" className="text-lg font-bold mb-2 block">
                    SKU
                  </Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => handleInputChange("sku", e.target.value)}
                    placeholder="PROD-001"
                    className="rounded-xl border border-gray-200 focus:border-gray-400"
                  />
                </div>
                <div>
                  <Label htmlFor="inventoryQuantity" className="text-lg font-bold mb-2 block">
                    Stock Quantity
                  </Label>
                  <Input
                    id="inventoryQuantity"
                    type="number"
                    min="0"
                    value={formData.inventoryQuantity}
                    onChange={(e) => handleInputChange("inventoryQuantity", e.target.value)}
                    className="rounded-xl border border-gray-200 focus:border-gray-400"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="trackInventory"
                  checked={formData.trackInventory}
                  onChange={(e) => handleInputChange("trackInventory", e.target.checked)}
                  className="w-5 h-5 rounded border border-gray-200"
                />
                <Label htmlFor="trackInventory" className="cursor-pointer">
                  Track inventory
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="allowBackorder"
                  checked={formData.allowBackorder}
                  onChange={(e) => handleInputChange("allowBackorder", e.target.checked)}
                  className="w-5 h-5 rounded border border-gray-200"
                />
                <Label htmlFor="allowBackorder" className="cursor-pointer">
                  Allow backorders
                </Label>
              </div>
            </div>
          )}

          {/* Shipping */}
          {formData.type === "physical" && (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">Shipping</h3>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="requiresShipping"
                  checked={formData.requiresShipping}
                  onChange={(e) => handleInputChange("requiresShipping", e.target.checked)}
                  className="w-5 h-5 rounded border border-gray-200"
                />
                <Label htmlFor="requiresShipping" className="cursor-pointer">
                  Requires shipping
                </Label>
              </div>
              {formData.requiresShipping && (
                <div>
                  <Label htmlFor="weight" className="text-lg font-bold mb-2 block">
                    Weight (lbs)
                  </Label>
                  <Input
                    id="weight"
                    value={formData.weight}
                    onChange={(e) => handleInputChange("weight", e.target.value)}
                    placeholder="0.5"
                    className="rounded-xl border border-gray-200 focus:border-gray-400"
                  />
                </div>
              )}
            </div>
          )}

          {/* Organization */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Organization</h3>
            <div>
              <Label htmlFor="category" className="text-lg font-bold mb-2 block">
                Category
              </Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                placeholder="e.g., Vinyl, Merch, Digital"
                className="rounded-xl border border-gray-200 focus:border-gray-400"
              />
            </div>
            <div>
              <Label htmlFor="tags" className="text-lg font-bold mb-2 block">
                Tags (comma-separated)
              </Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => handleInputChange("tags", e.target.value)}
                placeholder="limited edition, signed, exclusive"
                className="rounded-xl border border-gray-200 focus:border-gray-400"
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Status</h3>
            <div className="grid grid-cols-3 gap-4">
              {["draft", "active", "archived"].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => handleInputChange("status", status)}
                  className={`p-4 rounded-xl border transition-colors ${
                    formData.status === status
                      ? "border-black bg-black text-white"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) => handleInputChange("featured", e.target.checked)}
                className="w-5 h-5 rounded border border-gray-200"
              />
              <Label htmlFor="featured" className="cursor-pointer">
                Feature this product
              </Label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-8 border-t-2 border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/products")}
              className="flex-1 rounded-xl border border-gray-200 hover:border-gray-400 transition-colors"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex-1 bg-black text-white rounded-xl border border-black hover:bg-white hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(6,182,212,1)]"
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Saving..."
                : isEditing
                ? "Update Product"
                : "Create Product"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
