import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  X,
  Upload,
  Plus,
  Trash2,
  Save,
  Image as ImageIcon,
  Clock,
  Tag,
  AlertTriangle,
} from "lucide-react";
import type { Product, ProductFormData } from "../../types/product";
import { useProductStore } from "../../store/useProductStore";
import toast from "react-hot-toast";

const productSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  price: z.number().min(0.01, "Preço deve ser maior que 0"),
  category: z.string().min(1, "Categoria é obrigatória"),
  available: z.boolean(),
  preparationTime: z.number().min(0).optional(),
  calories: z.number().min(0).optional(),
  allergens: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  additionals: z.array(
    z.object({
      name: z.string().min(1, "Nome do adicional é obrigatório"),
      price: z.number().min(0, "Preço deve ser maior ou igual a 0"),
      required: z.boolean(),
      maxQuantity: z.number().min(1).optional(),
      options: z
        .array(
          z.object({
            name: z.string(),
            price: z.number(),
          })
        )
        .optional(),
    })
  ),
  removals: z.array(
    z.object({
      name: z.string().min(1, "Nome da remoção é obrigatório"),
      removable: z.boolean(),
    })
  ),
});

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product;
  workspaceId: string;
}

const commonAllergens = [
  "Glúten",
  "Lactose",
  "Ovos",
  "Amendoim",
  "Nozes",
  "Soja",
  "Peixe",
  "Crustáceos",
];

const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  product,
  workspaceId,
}) => {
  const { categories, createProduct, updateProduct } = useProductStore();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "",
      available: true,
      preparationTime: 0,
      calories: 0,
      allergens: [],
      tags: [],
      additionals: [],
      removals: [],
    },
  });

  const {
    fields: additionalFields,
    append: appendAdditional,
    remove: removeAdditional,
  } = useFieldArray({
    control,
    name: "additionals",
  });

  const {
    fields: removalFields,
    append: appendRemoval,
    remove: removeRemoval,
  } = useFieldArray({
    control,
    name: "removals",
  });

  // Populate form when editing
  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description || "",
        price: product.price,
        category: product.category,
        available: product.available,
        preparationTime: product.preparationTime || 0,
        calories: product.calories || 0,
        allergens: product.allergens || [],
        tags: product.tags || [],
        additionals: product.additionals.map((a) => ({
          name: a.name,
          price: a.price,
          required: a.required,
          maxQuantity: a.maxQuantity,
          options: a.options,
        })),
        removals: product.removals.map((r) => ({
          name: r.name,
          removable: r.removable,
        })),
      });

      if (product.image) {
        setImagePreview(product.image);
      }
    } else {
      reset({
        name: "",
        description: "",
        price: 0,
        category: "",
        available: true,
        preparationTime: 0,
        calories: 0,
        allergens: [],
        tags: [],
        additionals: [],
        removals: [],
      });
      setImagePreview(null);
      setImageFile(null);
    }
  }, [product, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAllergenToggle = (allergen: string) => {
    const currentAllergens = watch("allergens") || [];
    const newAllergens = currentAllergens.includes(allergen)
      ? currentAllergens.filter((a) => a !== allergen)
      : [...currentAllergens, allergen];
    setValue("allergens", newAllergens);
  };

  const addOptionToAdditional = (additionalIndex: number) => {
    const currentAdditional = watch(`additionals.${additionalIndex}`);
    const newOptions = [
      ...(currentAdditional.options || []),
      { name: "", price: 0, id: "" },
    ];
    setValue(`additionals.${additionalIndex}.options`, newOptions);
  };

  const removeOptionFromAdditional = (
    additionalIndex: number,
    optionIndex: number
  ) => {
    const currentAdditional = watch(`additionals.${additionalIndex}`);
    const newOptions = (currentAdditional.options || []).filter(
      (_, i) => i !== optionIndex
    );
    setValue(`additionals.${additionalIndex}.options`, newOptions);
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      const formData = {
        ...data,
        ...(imageFile ? { image: imageFile } : {}),
      };

      if (product) {
        await updateProduct(product.id, formData);
        toast.success("Produto atualizado com sucesso!");
      } else {
        await createProduct({ ...formData, workspaceId } as any);
        toast.success("Produto criado com sucesso!");
      }

      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao salvar produto");
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
            {product ? "Editar Produto" : "Novo Produto"}
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
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  {...register("name")}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Ex: X-Burger Especial"
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
                  placeholder="Descreva o produto..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preço (R$) *
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
                    Categoria *
                  </label>
                  <select
                    {...register("category")}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                      errors.category ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Selecione...</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.category.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="inline w-4 h-4 mr-1" />
                    Tempo de Preparo (min)
                  </label>
                  <input
                    type="number"
                    {...register("preparationTime", { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calorias (kcal)
                  </label>
                  <input
                    type="number"
                    {...register("calories", { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="0"
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
                  Produto disponível
                </label>
              </div>
            </div>

            {/* Right Column - Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagem do Produto
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setImageFile(null);
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Clique para fazer upload
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      PNG, JPG, GIF até 5MB
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Allergens */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <AlertTriangle className="inline w-4 h-4 mr-1" />
              Alérgenos
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {commonAllergens.map((allergen) => (
                <label
                  key={allergen}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={(watch("allergens") || []).includes(allergen)}
                    onChange={() => handleAllergenToggle(allergen)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{allergen}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="inline w-4 h-4 mr-1" />
              Tags (separadas por vírgula)
            </label>
            <input
              type="text"
              value={(watch("tags") || []).join(", ")}
              onChange={(e) => {
                const tags = e.target.value
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean);
                setValue("tags", tags);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Ex: picante, vegano, sem glúten"
            />
          </div>

          {/* Additionals */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Adicionais</h3>
              <button
                type="button"
                onClick={() =>
                  appendAdditional({
                    name: "",
                    price: 0,
                    required: false,
                    maxQuantity: 1,
                    options: [],
                  })
                }
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </button>
            </div>

            <div className="space-y-4">
              {additionalFields.map((field, index) => (
                <div
                  key={field.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <input
                          {...register(`additionals.${index}.name`)}
                          placeholder="Nome do adicional"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                        {errors.additionals?.[index]?.name && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.additionals[index]?.name?.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <input
                          type="number"
                          step="0.01"
                          {...register(`additionals.${index}.price`, {
                            valueAsNumber: true,
                          })}
                          placeholder="Preço"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          {...register(`additionals.${index}.maxQuantity`, {
                            valueAsNumber: true,
                          })}
                          placeholder="Qtd máxima"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          {...register(`additionals.${index}.required`)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
                        />
                        Obrigatório
                      </label>
                      <button
                        type="button"
                        onClick={() => removeAdditional(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Options for Additional */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Opções do Adicional
                      </span>
                      <button
                        type="button"
                        onClick={() => addOptionToAdditional(index)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        + Adicionar Opção
                      </button>
                    </div>

                    {watch(`additionals.${index}.options`)?.map(
                      (option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className="flex items-center gap-2 mb-2"
                        >
                          <input
                            {...register(
                              `additionals.${index}.options.${optionIndex}.name`
                            )}
                            placeholder="Nome da opção"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          />
                          <input
                            type="number"
                            step="0.01"
                            {...register(
                              `additionals.${index}.options.${optionIndex}.price`,
                              { valueAsNumber: true }
                            )}
                            placeholder="Preço"
                            className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              removeOptionFromAdditional(index, optionIndex)
                            }
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Removals */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Itens Removíveis
              </h3>
              <button
                type="button"
                onClick={() =>
                  appendRemoval({
                    name: "",
                    removable: true,
                  })
                }
                className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </button>
            </div>

            <div className="space-y-4">
              {removalFields.map((field, index) => (
                <div
                  key={field.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <input
                        {...register(`removals.${index}.name`)}
                        placeholder="Ex: Cebola, Tomate, Alface"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                      {errors.removals?.[index]?.name && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.removals[index]?.name?.message}
                        </p>
                      )}
                    </div>
                    <label className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        {...register(`removals.${index}.removable`)}
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 mr-2"
                      />
                      Removível
                    </label>
                    <button
                      type="button"
                      onClick={() => removeRemoval(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
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
              disabled={isSubmitting}
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
                  {product ? "Atualizar" : "Criar"} Produto
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
