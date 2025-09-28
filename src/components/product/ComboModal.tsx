import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  X,
  Plus,
  Trash2,
  Save,
  Package,
  Calculator,
  Search,
} from "lucide-react";
import type { ProductCombo, Product } from "../../types/product";
import { useProductStore } from "../../store/useProductStore";
import toast from "react-hot-toast";

const comboSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  price: z.number().min(0.01, "Preço deve ser maior que 0"),
  available: z.boolean(),
  validUntil: z.string().optional(),
  minItems: z.number().min(1).optional(),
  maxItems: z.number().min(1).optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "Produto é obrigatório"),
        quantity: z.number().min(1, "Quantidade deve ser maior que 0"),
        required: z.boolean(),
        category: z.string().optional(),
      })
    )
    .min(1, "Pelo menos um produto deve ser adicionado"),
});

type ComboFormData = z.infer<typeof comboSchema>;

interface ComboModalProps {
  isOpen: boolean;
  onClose: () => void;
  combo?: ProductCombo;
  workspaceId: string;
}

const ComboModal: React.FC<ComboModalProps> = ({
  isOpen,
  onClose,
  combo,
  workspaceId,
}) => {
  const { products, createCombo, updateCombo } = useProductStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showProductSelector, setShowProductSelector] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ComboFormData>({
    resolver: zodResolver(comboSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      available: true,
      validUntil: "",
      minItems: 1,
      maxItems: 10,
      items: [],
    },
  });

  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = watch("items");
  const watchedPrice = watch("price");

  // Calculate original price and discount
  const originalPrice = watchedItems.reduce((total, item) => {
    const product = products.find((p) => p.id === item.productId);
    return total + (product ? product.price * item.quantity : 0);
  }, 0);

  const discount =
    originalPrice > 0
      ? ((originalPrice - watchedPrice) / originalPrice) * 100
      : 0;

  useEffect(() => {
    if (combo) {
      reset({
        name: combo.name,
        description: combo.description || "",
        price: combo.price,
        available: combo.available,
        validUntil: combo.validUntil
          ? new Date(combo.validUntil).toISOString().split("T")[0]
          : "",
        minItems: combo.minItems || 1,
        maxItems: combo.maxItems || 10,
        items: combo.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          required: item.required,
          category: item.category,
        })),
      });
    } else {
      reset({
        name: "",
        description: "",
        price: 0,
        available: true,
        validUntil: "",
        minItems: 1,
        maxItems: 10,
        items: [],
      });
    }
  }, [combo, reset]);

  const filteredProducts = products.filter(
    (product) =>
      product.available &&
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !watchedItems.some((item) => item.productId === product.id)
  );

  const addProduct = (product: Product) => {
    appendItem({
      productId: product.id,
      quantity: 1,
      required: false,
      category: product.category,
    });
    setShowProductSelector(false);
    setSearchTerm("");
  };

  const onSubmit = async (data: ComboFormData) => {
    setIsSubmitting(true);
    try {
      const comboData = {
        ...data,
        originalPrice,
        discount: Math.round(discount),
        workspaceId,
        validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
        items: data.items.map((item) => ({
          ...item,
          product: products.find((p) => p.id === item.productId)!,
        })),
      };

      if (combo) {
        await updateCombo(combo.id, comboData);
        toast.success("Combo atualizado com sucesso!");
      } else {
        await createCombo(comboData);
        toast.success("Combo criado com sucesso!");
      }

      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao salvar combo");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {combo ? "Editar Combo" : "Novo Combo"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Combo *
                </label>
                <input
                  type="text"
                  {...register("name")}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Ex: Combo Big Burger"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  {...register("description")}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                  placeholder="Descreva o combo..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preço do Combo (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("price", { valueAsNumber: true })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                      errors.price ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="0,00"
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.price.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Válido até
                  </label>
                  <input
                    type="date"
                    {...register("validUntil")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mín. de Itens
                  </label>
                  <input
                    type="number"
                    min="1"
                    {...register("minItems", { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Máx. de Itens
                  </label>
                  <input
                    type="number"
                    min="1"
                    {...register("maxItems", { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="10"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register("available")}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Combo disponível
                </label>
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Resumo de Preços
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Preço Original:</span>
                  <span className="text-sm font-medium">
                    R${" "}
                    {originalPrice.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Preço do Combo:</span>
                  <span className="text-sm font-medium text-blue-600">
                    R${" "}
                    {watchedPrice.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>

                <div className="flex justify-between border-t pt-3">
                  <span className="text-sm font-medium text-gray-900">
                    Desconto:
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      discount > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {discount > 0 ? "-" : "+"}
                    {Math.abs(discount).toFixed(1)}%
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Economia:</span>
                    <span className="text-sm font-medium text-green-600">
                      R${" "}
                      {(originalPrice - watchedPrice).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Products in Combo */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Produtos do Combo
              </h3>
              <button
                type="button"
                onClick={() => setShowProductSelector(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Adicionar Produto
              </button>
            </div>

            {errors.items && (
              <p className="mb-4 text-sm text-red-600">
                {errors.items.message}
              </p>
            )}

            <div className="space-y-4">
              {itemFields.map((field, index) => {
                const product = products.find(
                  (p) => p.id === watchedItems[index]?.productId
                );
                return (
                  <div
                    key={field.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Package className="w-5 h-5 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {product?.name || "Produto não encontrado"}
                          </span>
                          <span className="text-sm text-gray-500">
                            R${" "}
                            {product?.price.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              Quantidade
                            </label>
                            <input
                              type="number"
                              min="1"
                              {...register(`items.${index}.quantity`, {
                                valueAsNumber: true,
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                          </div>

                          <div className="flex items-end">
                            <label className="flex items-center text-sm">
                              <input
                                type="checkbox"
                                {...register(`items.${index}.required`)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
                              />
                              Item obrigatório
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          Subtotal: R${" "}
                          {(
                            (product?.price || 0) *
                            (watchedItems[index]?.quantity || 1)
                          ).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {itemFields.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>Nenhum produto adicionado ao combo</p>
                  <p className="text-sm">
                    Clique em "Adicionar Produto" para começar
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || itemFields.length === 0}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {combo ? "Atualizar" : "Criar"} Combo
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Product Selector Modal */}
      {showProductSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden mx-4">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Selecionar Produto
                </h3>
                <button
                  onClick={() => setShowProductSelector(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar produto..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 gap-2">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addProduct(product)}
                    className="flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Package className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        R${" "}
                        {product.price.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    <Plus className="w-5 h-5 text-blue-600" />
                  </button>
                ))}

                {filteredProducts.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>Nenhum produto encontrado</p>
                    {searchTerm && (
                      <p className="text-sm">Tente buscar por outro termo</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComboModal;
