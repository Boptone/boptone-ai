import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus, X, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";


interface ProductFormProps {
  onClose: () => void;
  onSuccess: () => void;
  productId?: number;
}

export function ProductForm({ onClose, onSuccess, productId }: ProductFormProps) {
  const utils = trpc.useUtils();
  const isEdit = !!productId;

  // Form state
  const [type, setType] = useState<"physical" | "digital" | "experience">("physical");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [sku, setSku] = useState("");
  const [inventory, setInventory] = useState("");
  const [trackInventory, setTrackInventory] = useState(true);
  const [requiresShipping, setRequiresShipping] = useState(true);
  const [weight, setWeight] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [status, setStatus] = useState<"draft" | "active" | "archived">("draft");

  // Variants state
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<Array<{
    name: string;
    sku: string;
    price: string;
    inventory: string;
  }>>([]);

  // Create product mutation
  const createProduct = trpc.ecommerce.products.create.useMutation({
    onSuccess: () => {
      toast.success("Product created successfully!");
      utils.ecommerce.products.getMy.invalidate();
      onSuccess();
    },
    onError: (error) => {
      toast.error(`Failed to create product: ${error.message}`);
    },
  });

  // Upload file mutation
  const uploadFile = trpc.system.uploadFile.useMutation();

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploadingImage(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);
      
      // Convert to base64
      const base64 = btoa(String.fromCharCode(...buffer));
      
      // Generate unique filename
      const ext = file.name.split('.').pop();
      const randomSuffix = Math.random().toString(36).substring(7);
      const fileKey = `products/${Date.now()}-${randomSuffix}.${ext}`;
      
      const result = await uploadFile.mutateAsync({
        fileKey,
        data: base64,
        contentType: file.type,
      });
      
      setImages([...images, result.url]);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload image");
      console.error(error);
    } finally {
      setUploadingImage(false);
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!name.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (!price || parseFloat(price) <= 0) {
      toast.error("Valid price is required");
      return;
    }

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Convert price to cents
    const priceInCents = Math.round(parseFloat(price) * 100);
    const compareAtPriceInCents = compareAtPrice ? Math.round(parseFloat(compareAtPrice) * 100) : undefined;

    createProduct.mutate({
      type,
      name: name.trim(),
      description: description.trim() || undefined,
      price: priceInCents,
      compareAtPrice: compareAtPriceInCents,
      sku: sku.trim() || undefined,
      inventoryQuantity: inventory ? parseInt(inventory) : 0,
      trackInventory,
      requiresShipping: type === "physical" ? requiresShipping : false,
      weight: weight.trim() || undefined,
      images: images.map((url, index) => ({
        url,
        position: index,
      })),
      primaryImageUrl: images[0],
      slug,
      status,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-3xl border-2 border-black my-8">
        <form onSubmit={handleSubmit} className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-black tracking-tighter">
              {isEdit ? "EDIT PRODUCT" : "ADD PRODUCT"}
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-2 border-black"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Product Type */}
          <div className="mb-6">
            <Label className="font-bold mb-2 block">PRODUCT TYPE</Label>
            <div className="grid grid-cols-3 gap-3">
              {(["physical", "digital", "experience"] as const).map((t) => (
                <Button
                  key={t}
                  type="button"
                  variant={type === t ? "default" : "outline"}
                  onClick={() => setType(t)}
                  className={`font-bold uppercase ${
                    type === t
                      ? "bg-black text-white"
                      : "border-2 border-black"
                  }`}
                >
                  {t}
                </Button>
              ))}
            </div>
          </div>

          {/* Basic Info */}
          <div className="space-y-4 mb-6">
            <div>
              <Label htmlFor="name" className="font-bold">PRODUCT NAME *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Limited Edition Vinyl"
                className="border-2 border-black mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="description" className="font-bold">DESCRIPTION</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your product..."
                rows={4}
                className="border-2 border-black mt-1"
              />
            </div>
          </div>

          {/* Images */}
          <div className="mb-6">
            <Label className="font-bold mb-2 block">PRODUCT IMAGES</Label>
            <div className="grid grid-cols-4 gap-3">
              {images.map((url, index) => (
                <div key={index} className="relative aspect-square border-2 border-black">
                  <img src={url} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 h-6 w-6 p-0 bg-white border-2 border-black"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              {images.length < 4 && (
                <label className="aspect-square border-2 border-dashed border-black flex items-center justify-center cursor-pointer hover:bg-gray-50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                  {uploadingImage ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </label>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Upload up to 4 images (max 5MB each)
            </p>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <Label htmlFor="price" className="font-bold">PRICE (USD) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="29.99"
                className="border-2 border-black mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="compareAtPrice" className="font-bold">COMPARE AT PRICE</Label>
              <Input
                id="compareAtPrice"
                type="number"
                step="0.01"
                min="0"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                placeholder="39.99"
                className="border-2 border-black mt-1"
              />
            </div>
          </div>

          {/* Inventory */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <Label htmlFor="sku" className="font-bold">SKU</Label>
              <Input
                id="sku"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="PROD-001"
                className="border-2 border-black mt-1"
              />
            </div>
            <div>
              <Label htmlFor="inventory" className="font-bold">INVENTORY</Label>
              <Input
                id="inventory"
                type="number"
                min="0"
                value={inventory}
                onChange={(e) => setInventory(e.target.value)}
                placeholder="100"
                className="border-2 border-black mt-1"
              />
            </div>
          </div>

          {/* Shipping (Physical only) */}
          {type === "physical" && (
            <div className="mb-6">
              <Label htmlFor="weight" className="font-bold">WEIGHT (LBS)</Label>
              <Input
                id="weight"
                type="number"
                step="0.01"
                min="0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="1.5"
                className="border-2 border-black mt-1"
              />
            </div>
          )}

          {/* Status */}
          <div className="mb-6">
            <Label className="font-bold mb-2 block">STATUS</Label>
            <div className="grid grid-cols-3 gap-3">
              {(["draft", "active", "archived"] as const).map((s) => (
                <Button
                  key={s}
                  type="button"
                  variant={status === s ? "default" : "outline"}
                  onClick={() => setStatus(s)}
                  className={`font-bold uppercase ${
                    status === s
                      ? "bg-black text-white"
                      : "border-2 border-black"
                  }`}
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={createProduct.isPending}
              className="flex-1 bg-black text-white hover:bg-gray-800 font-bold"
            >
              {createProduct.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  SAVING...
                </>
              ) : (
                <>
                  {isEdit ? "UPDATE PRODUCT" : "CREATE PRODUCT"}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-2 border-black font-bold"
            >
              CANCEL
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
